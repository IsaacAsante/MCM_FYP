/*---LEFT BAR ACCORDION----*/

var jQuery = require("jquery");
var $ = require("jquery");

var Script = (function () {
  //    sidebar toggle

  $(function () {
    function responsiveView() {
      var wSize = $(window).width();
      if (wSize <= 768) {
        $("#container").addClass("sidebar-close");
        $("#sidebar > ul").hide();
      }

      if (wSize > 768) {
        $("#container").removeClass("sidebar-close");
        $("#sidebar > ul").show();
      }
    }
    $(window).on("load", responsiveView);
    $(window).on("resize", responsiveView);
  });

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
      // console.log("Hiding");
      $("#container").addClass("sidebar-closed");
    } else {
      // console.log("Showing 1");
      $("#main-content").css({
        "margin-left": "210px",
      });
      $("#sidebar > ul").show();
      $("#sidebar").css({
        "margin-left": "0",
      });
      $("#container").removeClass("sidebar-closed");
      // console.log("Showing 2");
    }
  });
})();
