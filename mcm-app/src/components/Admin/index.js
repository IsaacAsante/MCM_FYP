import React from "react";

import * as ROLES from "../../constants/roles";
import { withAuthorization } from "../Session";

const AdminPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>Admin component</h1>
        <p>Page restricted to the System Admin.</p>
      </section>
    </section>
  </div>
);

const condition = (authUser) => authUser && !!authUser.roles[ROLES.ADMIN];

export default withAuthorization(condition)(AdminPage);
