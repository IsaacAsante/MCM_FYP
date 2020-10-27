import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

// Scripts
import "bootstrap/dist/js/bootstrap.bundle";

// Import Components
import AccountPage from "../Account";
import AdminPage from "../Admin";
import DashboardPage from "../Dashboard";
import LandingPage from "../Landing";
import Navigation from "../Navigation";
import PasswordResetPage from "../PasswordReset";
import PasswordUpdatePage from "../PasswordUpdate";
import SignInPage from "../SignIn";
import SignUpPage from "../SignUp";
import Sidebar from "../Sidebar";

// Import Features components
import AddUnitPage from "../AddUnit";
import AddSemesterPage from "../Semester";

// Routing
import * as ROUTES from "../../constants/routes";
import { withAuthentication } from "../Session";

// CSS
import "../../template/lib/bootstrap/css/bootstrap.min.css";
import "../../template/lib/font-awesome/css/font-awesome.css";
import "../../template/css/style.css";
import "../../template/css/style-responsive.css";

// Manages local state of an authUser object
const App = () => (
  <Router>
    <div id="container">
      <Navigation />
      <Sidebar />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.DASHBOARD} component={DashboardPage} />
      <Route path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route path={ROUTES.PASSWORD_UPDATE} component={PasswordUpdatePage} />
      <Route path={ROUTES.PASSWORD_RESET} component={PasswordResetPage} />
      <Route path={ROUTES.ADD_UNIT} component={AddUnitPage} />
      <Route path={ROUTES.ADD_SEMESTER} component={AddSemesterPage} />
      <Route path={ROUTES.SINGLE_UNIT} component={DashboardPage} />
    </div>
  </Router>
);

export default withAuthentication(App);
