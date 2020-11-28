var express = require("express");
var router = express.Router();
var multer = require("multer");
var cors = require("cors");
var path = require("path");
var XLSX = require("xlsx");
const fs = require("fs");

router.use(cors());

// Help source: https://programmingwithmosh.com/javascript/react-file-upload-proper-server-side-nodejs-easy/

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __dirname);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

var upload = multer({ storage: storage }).single("file");

router.post("/", function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    const workbook = XLSX.readFile(path.join(__dirname, req.file.filename));
    console.log(req.file.filename);
    // Delete file from the directory
    fs.unlink(path.join(__dirname, req.file.filename), function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log("File deleted.");
      }
    });
    // Send back the file's sheets
    return res.status(200).send(workbook.Sheets);
  });
});

module.exports = router;
