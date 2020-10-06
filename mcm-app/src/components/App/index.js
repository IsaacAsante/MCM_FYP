import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";

// Scripts
import "bootstrap/dist/js/bootstrap.bundle";

// Import Components
import Navigation from "../Navigation";
import LandingPage from "../Landing";
import SignUpPage from "../SignUp";
import SignInPage from "../SignIn";
import PasswordForgetPage from "../PasswordForget";
import DashboardPage from "../Dashboard";
import AccountPage from "../Account";
import AdminPage from "../Admin";
import Sidebar from "../Sidebar";

// Routing
import * as ROUTES from "../../constants/routes";

// CSS
import "../../template/lib/bootstrap/css/bootstrap.min.css";
import "../../template/lib/font-awesome/css/font-awesome.css";
import "../../template/css/style.css";
import "../../template/css/style-responsive.css";

// Manages local state of an authUser object
class App extends Component {
  constructor(props) {
    super(props);

    // Handles session
    this.state = {
      authUser: null,
    };
  }

  render() {
    return (
      <div id="container">
        <Router>
          <Navigation authUser={this.state.authUser} />
          <Sidebar />
          <Route path={ROUTES.DASHBOARD} component={DashboardPage} />
          <Route path={ROUTES.SIGN_IN} component={SignInPage} />
          <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
          <Route path={ROUTES.PASSWORD_FORGET} component={PasswordForgetPage} />
        </Router>
      </div>
    );
  }
}

export default App;
