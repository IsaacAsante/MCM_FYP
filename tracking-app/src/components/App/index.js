import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

// Scripts
import "bootstrap/dist/js/bootstrap.bundle";

// Import Basic components
import AccountPage from "../Account";
import DashboardPage from "../Dashboard";
import Navigation from "../Navigation";
import PasswordResetPage from "../PasswordReset";
import PasswordUpdatePage from "../PasswordUpdate";
import SignInPage from "../SignIn";
import SignUpPage from "../SignUp";
import Sidebar from "../Sidebar";
import SingleViolationPage from "../Single_Violation";
import ViolationPage from "../Violation";

// Routing
import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";

// CSS
import "../../template/lib/bootstrap/css/bootstrap.min.css";
import "../../template/lib/font-awesome/css/font-awesome.css";
import "../../template/css/style.css";
import "../../template/css/style-responsive.css";
import "../../template/css/to-do.css";
import "react-datepicker/dist/react-datepicker.css";
import "../../template/css/custom.css";

// Manages local state of an authUser object
const App = () => (
  <Router>
    <div id="container">
      <Navigation />
      <Sidebar />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.DASHBOARD} component={DashboardPage} />
      <Route exact path={ROUTES.HOME} component={DashboardPage} />
      <Route path={ROUTES.PASSWORD_UPDATE} component={PasswordUpdatePage} />
      <Route path={ROUTES.PASSWORD_RESET} component={PasswordResetPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route
        exact
        path={ROUTES.SINGLE_VIOLATION}
        component={SingleViolationPage}
      />
      <Route path={ROUTES.VIOLATIONS} component={ViolationPage} />
    </div>
  </Router>
);

export default withAuthentication(App);
