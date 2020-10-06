import React from "react";
import SignInButton from "../SignIn/button";
import SignOutButton from "../SignOut";

const Navigation = ({ authUser }) => (
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
      {authUser ? <SignOutButton /> : <SignInButton />}
    </header>
    {/* <!--header end--> */}
  </div>
);

export default Navigation;
