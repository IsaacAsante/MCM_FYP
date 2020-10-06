import React from "react";
import SignInButton from "../SignIn/button";
import SignOutButton from "../SignOut";
import { AuthUserContext } from "../Session";

const Navigation = () => (
  <div>
    {/* <!--header start--> */}
    <AuthUserContext.Consumer>
      {(authUser) =>
        authUser ? <NavAuthentication /> : <NavNonAuthentication />
      }
    </AuthUserContext.Consumer>
    {/* <!--header end--> */}
  </div>
);

const NavAuthentication = () => (
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
        MCM<span> System</span>
      </b>
    </a>
    <SignOutButton />
  </header>
);

const NavNonAuthentication = () => (
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
        MCM<span> System</span>
      </b>
    </a>
    <SignInButton />
  </header>
);
export default Navigation;
