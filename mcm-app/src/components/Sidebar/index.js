import React, { Component } from "react";
import { Link } from "react-router-dom";
import * as ROUTES from "../../constants/routes.js";

var $ = require("jquery");

export default class Sidebar extends Component {
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
      console.log($(window).width());
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
    $("#sidebar > ul > li > a").on("click", function () {
      if ($(window).width() < 768) $("#sidebar > ul").hide();
    });

    // if ($("#container").hasClass("sidebar-closed"))

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
                  <span>Units</span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SIGN_IN}>
                  <i className="fa fa-envelope"></i>
                  <span>Tasks </span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
                </Link>
              </li>
              <li>
                <Link to={ROUTES.SIGN_IN}>
                  <i className="fa fa-envelope"></i>
                  <span>Bookings </span>
                  {/* <span className="label label-theme pull-right mail-info">2</span> */}
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
