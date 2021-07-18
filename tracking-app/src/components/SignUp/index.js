import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";
import DatePicker from "react-datepicker";
import axios from "axios";

import { withFirebase } from "../Firebase";
import { withAuthorization, withAuthentication } from "../Session";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";

const SignUpPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i className="fa fa-angle-right"></i> Create User Account
        </h3>
        <div className="row mt">
          <div className="col-lg-12">
            {/* Pass props */}
            <SignUpForm />
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  city: "",
  contact: "",
  dob: "",
  email: "",
  firstname: "",
  gender: "",
  governmentID: "",
  houseAddress: "",
  lastname: "",
  fixedLocation: {
    latitude: null,
    longitude: null,
  },
  flaggedAccelerometer: false,
  flaggedAuthentication: false,
  flaggedLocation: false,
  flaggedSpoofing: false,
  mapError: false,
  mapErrorMessage: "",
  mapSuccess: false,
  monitoring: "",
  passwordOne: "",
  passwordTwo: "",
  localState: "",
  pinLocation: "",
  role: "none",
  status: "Offline",
  violationCount: 0,
  firstLogin: 0,
  lastLogin: 0,
  lastLogout: 0,
  trackingBegin: 0,
  success: false,
  error: null,
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE }; // Cloning object
  }

  onSubmit = (event) => {
    // Grab form field values
    const { email, passwordOne, firstname, lastname, role } = this.state;
    const userData = { ...this.state };

    // Remove password from userData to prevent those fields from being accessible in the DB
    delete userData.passwordOne;
    delete userData.passwordTwo;

    console.log(userData);

    // Pass to Firebase class
    this.props.firebase
      .createUser(email, passwordOne)
      .then((authUser) => {
        console.log("AuthUser from Firebase Authentication:", authUser);
        // console.log("User (stringified): ", JSON.stringify(userData));
        // Add data to the right member collection in Firestore
        if (role == ROLES.MONITOR) {
          this.props.firebase
            .addUserToDB("monitors", authUser.user.uid, userData)
            .then((res) => {
              this.setState({ ...INITIAL_STATE }); // Clear forms
              //           // Send email
              //           axios
              //             .post(
              //               "/email/send",
              //               {
              //                 firstname,
              //                 lastname,
              //                 email,
              //                 passwordOne,
              //               },
              //               {
              //                 method: "POST",
              //                 headers: {
              //                   "Content-type": "application/json",
              //                 },
              //               }
              //             )
              //             .then((res) => {
              //               // console.log("Backend res: ", res);
              //               this.props.history.push(ROUTES.DASHBOARD);
              //             })
              //             .catch((err) => {
              //               console.error("Error from backend: ", err);
              //             });
              this.props.history.push(ROUTES.DASHBOARD);
            })
            .catch((error) => this.setState({ error }));
        }

        // Add data to users collection in Firestore
        if (role == ROLES.USER) {
          this.props.firebase
            .addUserToDB("users", authUser.user.uid, userData)
            .then((res) => {
              this.setState({ ...INITIAL_STATE }); // Clear forms
              this.setState({ success: true });
              this.props.history.push(ROUTES.DASHBOARD);
            })
            .catch((error) => this.setState({ error }));
        }
      })
      .catch((error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  onDateSet = (date) => {
    this.setState({ dob: date });
  };

  getCoordinates = (event) => {
    const url = event.target.value;
    if (url && typeof url === "string" && url.includes(",")) {
      const coordinates = url.split(",");
      if (coordinates.length == 2) {
        const lat = Number(coordinates[0]);
        const lon = Number(coordinates[1]);
        if (lat && lon) {
          this.setState({
            fixedLocation: {
              latitude: lat,
              longitude: lon,
            },
            pinLocation: `${lat}, ${lon}`,
            mapError: false,
            mapErrorMessage: "",
            mapSuccess: true,
          });
        }
      } else {
        this.setState({
          mapError: true,
          mapErrorMessage:
            "Something went wrong while processing the coordinates.",
          mapSuccess: false,
          pinLocation: "",
        });
      }
    } else {
      this.setState({
        mapError: true,
        mapErrorMessage:
          "Invalid input. Please paste the correct Google Maps coordinates. Do not type directly in this field.",
        mapSuccess: false,
        pinLocation: "",
      });
    }
  };
  updateType = (event) => {
    this.setState({ role: event.target.value });
    // console.log(event.target.value);
  };

  updateLocalState = (event) => {
    this.setState({ localState: event.target.value });
  };

  updateGender = (event) => {
    this.setState({ gender: event.target.value });
  };

  componentDidMount() {}

  // Update form fields onChange.
  render() {
    const {
      city,
      contact,
      dob,
      email,
      firstname,
      gender,
      governmentID,
      houseAddress,
      lastname,
      fixedLocation,
      mapError,
      mapErrorMessage,
      mapSuccess,
      monitoring,
      passwordOne,
      passwordTwo,
      pinLocation,
      localState,
      status,
      violationCount,
      role,
      success,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      city === "" ||
      contact === "" ||
      dob === "" ||
      email === "" ||
      firstname === "" ||
      gender === "" ||
      governmentID === "" ||
      houseAddress === "" ||
      pinLocation === "" ||
      lastname === "" ||
      localState === "" ||
      role === "none";

    const passwordMismatch = passwordOne !== passwordTwo;

    return (
      <div>
        {success ? (
          <div className="row">
            <div className="col-sm-12">
              <div className="alert alert-success">
                <b>Account created successfully.</b>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        <form
          onSubmit={this.onSubmit}
          className="form-horizontal style-form"
          autoComplete="off"
        >
          {error ? (
            <div className="form-group has-error">
              <div className="col-lg-10">
                <p className="help-block">{error.message}</p>
              </div>
            </div>
          ) : (
            ""
          )}

          {/* Basic account details */}
          <div className="row">
            <div className="col-sm-12">
              <div className="form-panel">
                <h4 className="mb">
                  <i className="fa fa-angle-right"></i> Basic account details
                </h4>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    User's First Name
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="firstname"
                      value={firstname}
                      onChange={this.onChange}
                      type="text"
                      placeholder="First name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    User's Last Name
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="lastname"
                      value={lastname}
                      onChange={this.onChange}
                      type="text"
                      placeholder="Last name"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    User Email
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="email"
                      value={email}
                      onChange={this.onChange}
                      type="email"
                      placeholder="Email address"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    Password
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="passwordOne"
                      value={passwordOne}
                      onChange={this.onChange}
                      type="password"
                      placeholder="Password"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    Confirm Password
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="passwordTwo"
                      value={passwordTwo}
                      onChange={this.onChange}
                      type="password"
                      placeholder="Password must match"
                      className="form-control"
                    />
                  </div>

                  <div className="col-sm-10">
                    {passwordMismatch && (
                      <p className="help-block pt-1">
                        Please ensure that passwords are matching.
                      </p>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    Account Type
                  </label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="role"
                      onChange={this.updateType}
                      value={this.state.role}
                    >
                      <option value="None">Select a role</option>
                      <option value="Monitor">Monitor</option>
                      <option value="User">User</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced account details */}
          <div className="row">
            <div className="col-sm-12">
              <div className="form-panel">
                <h4 className="mb">
                  <i className="fa fa-angle-right"></i> Advanced user details
                </h4>

                <p>Pick Gender:</p>

                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      id="male"
                      value="Male"
                      onChange={this.updateGender}
                    />
                    Male
                  </label>
                </div>
                <div className="radio">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      id="female"
                      value="Female"
                      onChange={this.updateGender}
                    />
                    Female
                  </label>
                </div>
                <hr />
                <label className="col-sm-2 col-sm-2 control-label pl-0">
                  Date of Birth
                </label>
                <DatePicker
                  selected={dob}
                  name="dob"
                  className="form-control mb-4"
                  onChange={this.onDateSet}
                  autoComplete="off"
                />

                <div className="form-group mt">
                  <label className="col-sm-2 col-sm-2 control-label">
                    Contact Number
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="contact"
                      value={contact}
                      onChange={this.onChange}
                      type="text"
                      placeholder="Mobile phone number"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group mt">
                  <label className="col-sm-2 col-sm-2 control-label">
                    Government ID
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="governmentID"
                      value={governmentID}
                      onChange={this.onChange}
                      type="text"
                      placeholder="IC or Passport number"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location details */}
          <div className="row">
            <div className="col-sm-12">
              <div className="form-panel">
                <h4 className="mb">
                  <i className="fa fa-angle-right"></i> User Location Details
                </h4>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    House Address
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="houseAddress"
                      value={houseAddress}
                      onChange={this.onChange}
                      type="text"
                      placeholder="House number, street, etc."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    City
                  </label>
                  <div className="col-sm-10">
                    <input
                      name="city"
                      value={city}
                      onChange={this.onChange}
                      type="text"
                      placeholder="City in Malaysia"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="col-sm-2 col-sm-2 control-label">
                    State
                  </label>
                  <div className="col-sm-10">
                    <select
                      className="form-control"
                      name="role"
                      onChange={this.updateLocalState}
                      value={this.state.localState}
                    >
                      <option value="None">Select a state</option>
                      <option value="Johor">Johor</option>
                      <option value="Kedah">Kedah</option>
                      <option value="Kelantan">Kelantan</option>
                      <option value="Malacca">Malacca</option>
                      <option value="Negeri Sembilan">Negeri Sembilan</option>
                      <option value="Pahang">Pahang</option>
                      <option value="Penang">Penang</option>
                      <option value="Perak">Perak</option>
                      <option value="Perlis">Perlis</option>
                      <option value="Sabah">Sabah</option>
                      <option value="Sarawak">Sarawak</option>
                      <option value="Selangor">Selangor</option>
                      <option value="Terengganu">Terengganu</option>
                    </select>
                  </div>
                </div>
                <hr />

                <div className="form-group mt">
                  <p className="col-sm-12 col-sm-12">
                    <strong>Exact location on the map</strong>
                  </p>
                  <div className="mt ml-3 mb-4">
                    Please go to{" "}
                    <a href="https://www.google.com/maps/" target="_blank">
                      Google Maps
                    </a>
                    , and follow these steps:
                    <ol>
                      <li>
                        Find the user's exact quarantine location on the map
                      </li>
                      <li>Place a pin at that location if necessary</li>
                      <li>Right-click precisely at the root of the pin</li>
                      <li>
                        Click on the coordinates (first option) to copy them
                      </li>
                      <li>
                        Paste the coordinates in the field below on this form
                      </li>
                    </ol>
                  </div>

                  <div className="col-sm-12">
                    <input
                      name="fixedLocation"
                      value={pinLocation}
                      onChange={this.getCoordinates}
                      type="text"
                      placeholder="Paste the Google Maps coordinates to the location's pin here"
                      className="form-control"
                    />
                    {mapError && !mapSuccess ? (
                      <div className="alert alert-danger mt mb-0">
                        {mapErrorMessage}
                      </div>
                    ) : (
                      ""
                    )}
                    {mapSuccess && !mapError ? (
                      <div className="alert alert-info mt mb-0">
                        Latitude and longitude coordinates extracted
                        successfully.{" "}
                        <a
                          href={`https://www.google.com/maps/search/${fixedLocation.latitude},${fixedLocation.longitude}`}
                          target="_blank"
                        >
                          Click to verify.
                        </a>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt">
            <button
              disabled={isInvalid}
              type="submit"
              className="btn btn-theme ml-2 mb-5"
            >
              Add User to System
            </button>
          </div>
        </form>
      </div>
    );
  }
}

const SignUpLink = () => (
  <p>
    <strong>
      <Link to={ROUTES.SIGN_UP}>Register new user</Link>
    </strong>
  </p>
);

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);

const condition = (authUser) => authUser && authUser.role == ROLES.MONITOR;

export default compose(
  withAuthentication,
  withAuthorization(condition)
)(SignUpPage);

export { SignUpForm, SignUpLink };
