import React from "react";
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

class SignUpForm extends Component {
  constructor(props) {
    super(props);
  }

  onSubmit = (event) => {};

  onChange = (event) => {};

  render() {
    return <form onSubmit={this.onSubmit}></form>;
  }
}

const SignUpLink = () => {
  <p>
    <Link to={ROUTES.SIGN_UP}>Register new user</Link>
  </p>;
};

export default SignUpPage;

export { SignUpForm, SignUpLink };
