import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { compose } from "recompose";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const SignUpPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i className="fa fa-angle-right"></i> Create User
        </h3>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              {/* Pass props */}
              <SignUpForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  fullName: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  type: "none",
  error: null,
};

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE }; // Cloning object
  }

  onSubmit = (event) => {
    // Grab form field values
    const { email, passwordOne } = this.state;
    // console.log(this.state);
    // Pass to Firebase class
    this.props.firebase
      .createUser(email, passwordOne)
      .then((authUser) => {
        console.log(authUser);
        this.setState({ ...INITIAL_STATE }); // Clear forms
        this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch((error) => {
        this.setState({ error });
      });
    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  updateType = (event) => {
    this.setState({ type: event.target.value });
    // console.log(event.target.value);
  };

  // Update form fields onChange.
  render() {
    const {
      fullName,
      email,
      passwordOne,
      passwordTwo,
      type,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      fullName === "" ||
      type === "none";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">User's Name</label>
          <div className="col-sm-10">
            <input
              name="fullName"
              value={fullName}
              onChange={this.onChange}
              type="text"
              placeholder="Full name"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">User Email</label>
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
          <label className="col-sm-2 col-sm-2 control-label">Password</label>
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
        </div>

        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Account Type
          </label>
          <div className="col-sm-10">
            <select
              className="form-control"
              name="type"
              onChange={this.updateType}
              value={this.state.type}
            >
              <option value="None">Select a type</option>
              <option value="Tutor">Tutor</option>
              <option value="Student">Student</option>
            </select>
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Create User
        </button>
        <div className="form-group has-error">
          <div className="col-lg-10">
            <p className="help-block">{error && error.message}</p>
          </div>
        </div>
      </form>
    );
  }
}

const SignUpLink = () => (
  // Returning sign up link.
  <p>
    <strong>
      <Link to={ROUTES.SIGN_UP}>Register new user</Link>
    </strong>
  </p>
);

const SignUpForm = compose(withRouter, withFirebase)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };
