import React from "react";
import { Link } from "react-router-dom";

import { withFirebase } from "../Firebase";

import * as ROUTES from "../../constants/routes";

const SignInButton = () => (
  <div className="top-menu">
    <ul className="nav pull-right top-menu">
      <li>
        <Link className="login-button" to={ROUTES.SIGN_IN}>
          Log In
        </Link>
      </li>
    </ul>
  </div>
);

export default withFirebase(SignInButton);
