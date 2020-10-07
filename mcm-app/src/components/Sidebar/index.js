import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes.js";

var $ = require("jquery");

export default class Sidebar extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    $(".fa-bars").on("click", function () {
      window.console && console.log("foo");
      if ($("#sidebar > ul").is(":visible") === true) {
        $("#main-content").css({
          "margin-left": "0px",
        });
        $("#sidebar").css({
          "margin-left": "-210px",
        });
        $("#sidebar > ul").hide();
        console.log("Hiding");
        $("#container").addClass("sidebar-closed");
      } else {
        console.log("Showing 1");
        $("#main-content").css({
          "margin-left": "210px",
        });
        $("#sidebar > ul").show();
        $("#sidebar").css({
          "margin-left": "0",
        });
        $("#container").removeClass("sidebar-closed");
        console.log("Showing 2");
      }
    });
  }

  render() {
    return (
      <div>
        {/* <!--sidebar start--> */}
        <aside>
          <div id="sidebar" className="nav-collapse ">
            {/* <!-- sidebar menu start--> */}
            <ul className="sidebar-menu" id="nav-accordion">
              <h5 className="centered">Isaac Asante</h5>
              <li className="mt">
                <Link to={ROUTES.DASHBOARD} className="active">
                  <i className="fa fa-dashboard"></i>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SIGN_IN}>
                  <i className="fa fa-envelope"></i>
                  <span>Login </span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SIGN_UP}>
                  <i className="fa fa-envelope"></i>
                  <span>Sign Up </span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ACCOUNT}>
                  <i className="fa fa-envelope"></i>
                  <span>Your Account</span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    );
  }
}
