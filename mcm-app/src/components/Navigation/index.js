import React from "react";


const Navigation = () => (
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
      <div className="top-menu">
        <ul className="nav pull-right top-menu">
          <li>
            <a className="logout" href="#">
              Logout
            </a>
          </li>
        </ul>
      </div>
    </header>
    {/* <!--header end--> */}
  </div>
);

export default Navigation;
