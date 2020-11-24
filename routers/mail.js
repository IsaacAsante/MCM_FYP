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
  console.log("Sign up email");
  console.log("req.body.body gives:", req.body);
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const emailAddress = req.body.email;
  const password = req.body.passwordOne;

  const plainMSG = `Dear ${
    firstname + " " + lastname
  },\n\nA new user account has been created for you by the administrator of Swinburne Sarawak's MCM System.\n\nKindly note that you may login to update your password in your account's settings, using the details below.\n\nURL: ${
    "https://" + req.get("host")
  }\nEmail: ${emailAddress}\nPassword: ${password}\n\nRegards,\nMCM Team`;

  const htmlMSG = `<p>Dear ${
    firstname + " " + lastname
  },</p><p>A new user account has been created for you by the administrator of Swinburne Sarawak's MCM System.</p><p>Kindly note that you may login to update your password in your account's settings, using the details below.</p><p><strong>URL:</strong> <a href="${
    "https://" + req.get("host")
  }">${
    "https://" + req.get("host")
  }</a><br/><strong>Email:</strong> ${emailAddress}<br /><strong>Password:</strong> ${password}</p><p>Regards,<br/>MCM Team</p>`;

  var mail = {
    from: '"MCM System" mcm@swinburne.edu.my',
    to: emailAddress,
    subject: "Your new MCM System account",
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
