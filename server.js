var express = require("express");
var cors = require("cors");
var app = express();
var path = require("path");

const port = process.env.PORT || 5000;

// Enable CORS and handle JSON requests
app.use(cors());
app.use(express.json());

app.post("/", function (req, res, next) {
  // console.log(req.body);
  res.json({ msg: "This is CORS-enabled for all origins!" });
});

// Set router for email notifications
const mailRouter = require("./routers/mail");
const readerRouter = require("./routers/reader");
const notificationsRouter = require("./routers/booking-notifications");
app.use("/email", mailRouter);
app.use("/reader", readerRouter);
app.use("/notifications", notificationsRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("mcm-app/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "mcm-app", "build", "index.html"));
  });
}

app.listen(port, () => {
  // console.log(`Server is running on port: ${port}`);
});
