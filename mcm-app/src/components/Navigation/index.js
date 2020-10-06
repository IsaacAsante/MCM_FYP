import React from "react";
import SignInButton from "../SignIn/button";
import SignOutButton from "../SignOut";

const Navigation = ({ authUser }) => (
  <div>{authUser ? <NavigationAuth /> : <NavigationNonAuth />}</div>
);

// Navigation rendered when the user is logged in
const NavigationAuth = () => (
  <div>
    {/* <!--header start--> */}
    <header className="header black-bg">
      <div className="sidebar-toggle-box">
        <div
          className="fa fa-bars tooltips"
          data-placement="right"
          data-original-title="Toggle Navigation"
        ></div>
      </div>
      {/* <!--logo start--> */}
      <a href="index.html" className="logo">
        <b>
          MCM<span> System</span>
        </b>
      </a>
      {/* <!--logo end--> */}
      <SignOutButton />
    </header>
    {/* <!--header end--> */}
  </div>
);

// Navigation rendered when the user is not logged in.
const NavigationNonAuth = () => (
  <div>
    {/* <!--header start--> */}
    <header className="header black-bg">
      <div className="sidebar-toggle-box">
        <div
          className="fa fa-bars tooltips"
          data-placement="right"
          data-original-title="Toggle Navigation"
        ></div>
      </div>
      {/* <!--logo start--> */}
      <a href="index.html" className="logo">
        <b>
          MCM<span> System</span>
        </b>
      </a>
      {/* <!--logo end--> */}
      <SignInButton />
    </header>
    {/* <!--header end--> */}
  </div>
);

export default Navigation;
