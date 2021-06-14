import { getRoles } from "@testing-library/react";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import * as ROLES from "../../constants/roles";
import { AuthUserContext } from "../Session";

var $ = require("jquery");

class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // Mobile viewport changes
    let sidebar_margin = $("#sidebar").css("margin-left");
    if (
      (sidebar_margin == "0" ||
        sidebar_margin == "0px" ||
        sidebar_margin == "0px !important") &&
      $(window).width() < 768
    ) {
      // console.log($(window).width());
      // Hide nav by default
      $("#sidebar > ul").hide();
    }

    $(window).on("resize", function () {
      if ($(window).width() >= 768) {
        $("#sidebar > ul").show();
      } else {
        $("#sidebar > ul").hide();
      }
    });

    // Hide nav when a link is clicked
    $("#sidebar > ul > div > div > li > a").on("click", function () {
      if ($(window).width() < 768) $("#sidebar > ul").hide();
    });

    // if ($("#container").hasClass("sidebar-closed"))

    $(".fa-bars").on("click", function () {
      // window.console && console.log("foo");
      if ($("#sidebar > ul").is(":visible") === true) {
        $("#main-content").css({
          "margin-left": "0px",
        });
        $("#sidebar").css({
          "margin-left": "-210px",
        });
        $("#sidebar > ul").hide();
        $("#container").addClass("sidebar-closed");
      } else {
        $("#main-content").css({
          "margin-left": "210px",
        });
        $("#sidebar > ul").show();
        $("#sidebar").css({
          "margin-left": "0",
        });
        $("#container").removeClass("sidebar-closed");
      }
    });
  }

  render() {
    return (
      <div>
        {/* <!--sidebar start--> */}
        <aside>
          <div id="sidebar" className="nav-collapse ">
            <ul className="sidebar-menu" id="nav-accordion">
              <AuthUserContext.Consumer>
                {(authUser) => {
                  if (!authUser) return <GenericNavbar />;
                  else {
                    if (authUser.role == ROLES.USER)
                      return (
                        <div>
                          <div className="user-email">
                            {authUser.firstname} {authUser.lastname}
                          </div>
                          <StudentNavbar />
                        </div>
                      );
                    else if (authUser.role == ROLES.MONITOR)
                      return (
                        <div>
                          <div className="user-email">
                            {authUser.firstname} {authUser.lastname}
                          </div>
                          <TutorNavbar />
                        </div>
                      );
                  }
                }}
              </AuthUserContext.Consumer>
              {/* <!-- sidebar menu start--> */}
            </ul>
          </div>
        </aside>
      </div>
    );
  }
}

const StudentNavbar = () => {
  return (
    <div>
      <h5 className="centered">User Account</h5>
      <li>
        <Link to={ROUTES.ACCOUNT}>
          <i className="fa fa-user"></i>
          <span>Profile</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
    </div>
  );
};

const TutorNavbar = () => {
  return (
    <div>
      <h5 className="centered">Monitor Account</h5>
      <li className="mt">
        <Link to={ROUTES.DASHBOARD}>
          <i className="fa fa-dashboard"></i>
          <span>Dashboard</span>
        </Link>
      </li>
      <li>
        <Link to={ROUTES.VIOLATIONS}>
          <i className="fa fa-exclamation-circle"></i>
          <span>View Violations</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
      <li>
        <Link to={ROUTES.DASHBOARD}>
          <i className="fa fa-flag"></i>
          <span>View Alerts</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
      <li>
        <Link to={ROUTES.DASHBOARD}>
          <i className="fa fa-bar-chart"></i>
          <span>Stats and Reports</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
      <li>
        <Link to={ROUTES.DASHBOARD}>
          <i className="fa fa-users"></i>
          <span>Users</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
      <li>
        <Link to={ROUTES.ACCOUNT}>
          <i className="fa fa-user"></i>
          <span>Your Account</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
      <li>
        <Link to={ROUTES.SIGN_UP}>
          <i className="fa fa-user-plus"></i>
          <span>Register User</span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
    </div>
  );
};

const GenericNavbar = () => {
  return (
    <div>
      <h5 className="centered">Welcome!</h5>
      <li className="mt">
        <Link to={ROUTES.SIGN_IN}>
          <i className="fa fa-key"></i>
          <span>Login </span>
          {/* <span className="label label-theme pull-right mail-info">2</span> */}
        </Link>
      </li>
    </div>
  );
};

export default Sidebar;