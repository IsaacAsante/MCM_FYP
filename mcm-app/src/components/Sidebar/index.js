import React, { Component } from "react";
import { Link } from "react-router-dom";
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
            <ul className="sidebar-menu" id="nav-accordion"></ul>
          </div>
        </aside>

        <section id="main-content">
          <section className="wrapper"></section>
        </section>
      </div>
    );
  }
}
