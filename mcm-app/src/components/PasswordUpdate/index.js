import React, { Component } from "react";

import { withFirebase } from "../Firebase";

const PasswordUpdatePage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>
          <i className="fa fa-angle-right"></i> Update Password
        </h1>
        <div className="row mt">
          <div className="col-lg-12">
            <div className="form-panel">
              <PasswordUpdateForm />
            </div>
          </div>
        </div>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  passwordOne: "",
  passwordTwo: "",
  error: null,
};

class PasswordUpdateFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = (event) => {
    const { passwordOne } = this.state;

    this.props.firebase
      .updateUserPassword(passwordOne)
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
    const { passwordOne, passwordTwo, error } = this.state;

    // Invalid is the passwords don't match (or empty)
    const isInvalid = passwordOne !== passwordTwo || passwordOne === "";

    return (
      <form onSubmit={this.onSubmit} className="form-horizontal style-form">
        <div className="form-group">
          <label className="col-sm-2 col-sm-2 control-label">
            Enter New Password
          </label>
          <div className="col-sm-10">
            <input
              name="passwordOne"
              value={passwordOne}
              onChange={this.onChange}
              type="password"
              placeholder="New password"
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
              placeholder="New password"
              className="form-control"
            />
          </div>
        </div>
        <button disabled={isInvalid} type="submit" className="btn btn-theme">
          Update Password
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

export default PasswordUpdatePage;

const PasswordUpdateForm = withFirebase(PasswordUpdateFormBase);

export { PasswordUpdateForm };
