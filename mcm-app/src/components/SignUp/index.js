import React, { Component } from "react";
import { Link } from "react-router-dom";

import * as ROUTES from "../../constants/routes";

const SignUpPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>SignUp component</h1>
      </section>
    </section>
  </div>
);

const INITIAL_STATE = {
  username: "",
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

  onChange = (event) => {};

  render() {
    return <form onSubmit={this.onSubmit}></form>;
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
