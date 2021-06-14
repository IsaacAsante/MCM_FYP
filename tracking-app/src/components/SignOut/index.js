import React from "react";

import { withFirebase } from "../Firebase";

const SignOutButton = ({ firebase }) => (
  <div className="top-menu">
    <ul className="nav pull-right top-menu">
      <li>
        <a className="logout" onClick={firebase.signOutUser}>
          Logout
        </a>
      </li>
    </ul>
  </div>
);

export default withFirebase(SignOutButton);
