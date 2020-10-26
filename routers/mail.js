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
  const plainMSG = `Dear ${firstname},\n\nA new student account has been created for you by the administrator of Swinburne Sarawak's MCM System.\n\nKindly note that you may login to update your password in your account's settings, using the details below.\n\nURL: ${req.get(
    "host"
  )}\nUsername or Email: ${emailAddress}`;
  const htmlMSG = `<p>Dear ${firstname},</p><p>A new student account has been created for you by the administrator of Swinburne Sarawak's MCM System.</p><p>Kindly note that you may login to update your password in your account's settings, using the details below.</p><p>URL: ${req.get(
    "host"
  )}<br/>Username or Email: ${emailAddress}</p><p>Regards,<br/>The MCM System Team</p>`;

  var mail = {
    from: '"MCM System" 101208203@students.swinburne.edu.my',
    to: emailAddress,
    subject: "Registration to MCM System",
    text: plainMSG,
    html: htmlMSG,
  };

  let transporter = nodemailer.createTransport({
    name: "smtp.office365.com",
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
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
