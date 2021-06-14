import React from "react";
import SignInButton from "../SignIn/button";
import SignOutButton from "../SignOut";
import { AuthUserContext } from "../Session";

const Navigation = () => (
  <div>
    <header className="header black-bg">
      <div className="sidebar-toggle-box">
        <div
          className="fa fa-bars tooltips"
          data-placement="right"
          data-original-title="Toggle Navigation"
        ></div>
      </div>
      {/* <!--logo start--> */}
      <a href="" className="logo">
        <b>
          Trackia <span> Monitoring</span>
        </b>
      </a>
      {/* <!--header start--> */}
      <AuthUserContext.Consumer>
        {(authUser) =>
          authUser ? <NavAuthentication /> : <NavNonAuthentication />
        }
      </AuthUserContext.Consumer>
      {/* <!--header end--> */}
    </header>
  </div>
);

const NavAuthentication = () => <SignOutButton />;

const NavNonAuthentication = () => <SignInButton />;
export default Navigation;
