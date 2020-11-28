const express = require("express");
const router = express.Router();
const app = express();
var bodyParser = require("body-parser");
require("dotenv").config();

const nodemailer = require("nodemailer");

// // parse application/x-www-form-urlencoded
router.use(bodyParser.urlencoded({ extended: false }));

// // parse application/json
router.use(bodyParser.json());

// Route for the Quote form
router.post("/send", (req, res, next) => {
  // console.log("Sign up email");
  // console.log("req.body.body gives:", req.body);
  const tutorEmail = req.body.tutorEmail;
  const studentFirstname = req.body.studentFirstname;
  const studentLastname = req.body.studentLastname;
  const offeringID = req.body.offeringID;
  const taskID = req.body.taskID;
  const slotID = req.body.slotID;

  const plainMSG = `Dear Tutor,\n\nA new booking has been submitted by ${studentFirstname} ${studentLastname} in the MCM system for one of your lab groups.\n\nURL: ${
    "https://" +
    req.get("host") +
    "/unit-offerings/" +
    offeringID +
    "/tasks/" +
    taskID +
    "/booking-slots/" +
    slotID
  }\n\nRegards,\nMCM Team`;

  const htmlMSG = `<p>Dear Tutor,</p><p>A new booking has been submitted by ${studentFirstname} ${studentLastname} in the MCM system for one of your lab groups.</p><p><strong>URL:</strong> <a href="${
    "https://" +
    req.get("host") +
    "/unit-offerings/" +
    offeringID +
    "/tasks/" +
    taskID +
    "/booking-slots/" +
    slotID
  }">View booking submission</a></p><p>Alternatively, you may also copy and paste the URL below into your address bar.</p><p>${
    "https://" +
    req.get("host") +
    "/unit-offerings/" +
    offeringID +
    "/tasks/" +
    taskID +
    "/booking-slots/" +
    slotID
  }</p><p>Regards,<br/>MCM Team</p>`;

  var mail = {
    from: '"MCM System" mcm@swinburne.edu.my',
    to: tutorEmail,
    subject: "New booking submitted",
    text: plainMSG,
    html: htmlMSG,
  };

  let transporter = nodemailer.createTransport({
    name: "smtp.mailtrap.io",
    host: "smtp.mailtrap.io",
    port: 587,
    secure: false,
    auth: {
      user: "61b7d62bc864f2",
      pass: "182117176e9c85",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log("Verification error: ", error);
    } else {
      console.log("Server is ready to take our messages!");
    }
  });

  transporter
    .sendMail(mail)
    .then(() => {
      return res
        .status(200)
        .json({ msg: "you should receive an email from us" });
    })
    .catch((error) =>
      console.error("Error sending email (from the Mail Router): ", error)
    );
});

module.exports = router;
