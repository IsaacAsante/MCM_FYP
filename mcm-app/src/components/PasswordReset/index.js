import React, { Component } from "react";
import { Link } from "react-router-dom";

import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const PasswordResetPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>
          <i className="fa fa-angle-right"></i> Reset Password
        </h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <PasswordResetForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  email: "",
  error: null,
};

class PasswordResetFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { email } = this.state;

    this.props.firebase
      .resetUserPassword(email)
      .then(() => {
        this.setState({ ...INITIAL_STATE });
      })
      .catch((error) => {
        this.setState({ error });
      });

    event.preventDefault();
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { email, error } = this.state;

    const isInvalid = email === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Email Address
          </label>
          <div className="col-sm-10">
            <input
              name="email"
              value={this.state.email}
              onChange={this.onChange}
              type="text"
              placeholder="Your email address"
              className="form-control"
            />
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Reset Password
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

const PasswordResetLink = () => (
  <p>
    <Link to={ROUTES.PASSWORD_RESET}>Forgot Password?</Link>
  </p>
);

export default PasswordResetPage;

const PasswordResetForm = withFirebase(PasswordResetFormBase);

export { PasswordResetForm, PasswordResetLink };
