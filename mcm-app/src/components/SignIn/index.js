import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { withFirebase } from "../Firebase";
import { PasswordResetLink } from "../PasswordReset";
import * as ROUTES from "../../constants/routes";

const SignInPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>
          <i className="fa fa-angle-right"></i> Log In
        </h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <SignInForm />
              <PasswordResetLink />
              <SignUpLink />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  email: "",
  password: "",
  error: null,
};

class SignInFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { email, password } = this.state;

    this.props.firebase
      .signInUser(email, password)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
        console.log("Successfully logged in");
        this.props.history.push(ROUTES.DASHBOARD);
      })
      .catch((error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value.trim() });
  };

  render() {
    // Grab the state
    const { email, password, error } = this.state;
    // Both email and password fields must be filled
    const isInvalid = password === "" || email === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Email Address
          </label>
          <div className="col-sm-10">
            <input
              name="email"
              value={email}
              onChange={this.onChange}
              type="text"
              placeholder="Your email address"
              className="form-control"
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">Password</label>
          <div className="col-sm-10">
            <input
              name="password"
              value={password}
              onChange={this.onChange}
              type="password"
              placeholder="Your password"
              className="form-control"
            />
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Log In
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

const SignInForm = compose(withRouter, withFirebase)(SignInFormBase);

export default SignInPage;

export { SignInForm };
