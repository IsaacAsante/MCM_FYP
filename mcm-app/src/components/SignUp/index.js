import React, { Component } from "react";
import { Link } from "react-router-dom";

import * as ROUTES from "../../constants/routes";

const SignUpPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h3>
          <i class="fa fa-angle-right"></i> Create User
        </h3>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <SignUpForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  studentName: "",
  studentId: "",
  email: "",
  passwordOne: "",
  passwordTwo: "",
  error: null,
};

class SignUpForm extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE }; // Cloning object
  }

  onSubmit = (event) => {};

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  // Update form fields onChange.
  render() {
    const {
      studentName,
      studentId,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === "" ||
      email === "" ||
      studentName === "" ||
      studentId === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Student Name
          </label>
          <div className="col-sm-10">
            <input
              name="studentName"
              value={studentName}
              onChange={this.onChange}
              type="text"
              placeholder="Full name"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">Student ID</label>
          <div className="col-sm-10">
            <input
              name="studentId"
              value={studentId}
              onChange={this.onChange}
              type="text"
              placeholder="Student ID will serve as username"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Student Email
          </label>
          <div className="col-sm-10">
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              placeholder="Email Address"
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
              placeholder="Confirm Password"
              className="form-control"
            />
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Create User
        </button>
        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  // Returning sign up link.
  <p>
    <Link to={ROUTES.SIGN_UP}>Register new user</Link>
  </p>
);

export default SignUpPage;

export { SignUpForm, SignUpLink };
