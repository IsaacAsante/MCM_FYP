import React from "react";

import { withAuthorization } from "../Session";

const DashboardPage = () => (
  <div>
    <section id="main-content">
      <section className="wrapper">
        <h1>Dashboard component</h1>
      </section>
    </section>
  </div>
);

const condition = (authUser) => !!authUser;

export default withAuthorization(condition)(DashboardPage);
