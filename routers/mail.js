const express = require("express");
const router = express.Router();
require("dotenv").config();

const nodemailer = require("nodemailer");

// Route for the Quote form
router.post("/send", (req, res, next) => {
  console.log("Send route");
  var mail = {
    from: '"MCM System" 101208203@students.swinburne.edu.my',
    to: "isaac.editor16@gmail.com",
    subject: "MCM email notification test",
    text: "Verifying if the email is working.",
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
