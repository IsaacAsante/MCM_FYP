import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";

import { SignUpLink } from "../SignUp";
import { withFirebase } from "../Firebase";
import * as ROUTES from "../../constants/routes";

const SignInPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>SignIn component</h1>
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
}

export default SignInPage;
