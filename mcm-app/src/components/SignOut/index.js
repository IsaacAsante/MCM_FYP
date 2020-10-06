import React from "react";

import { withFirebase } from "../Firebase";

const SignOutButton = () => (
  <div className="top-menu">
    <ul className="nav pull-right top-menu">
      <li>
        <a className="logout" href="#">
          Logout
        </a>
      </li>
    </ul>
  </div>
);

export default SignOutButton;
