const express = require("express");
const { compressVideo, getCallback } = require("../controllers");
const router = express.Router();
const multer = require("multer");

const upload = multer({});

router.post(
  "/",
  upload.fields([{ name: "video", maxCount: 1 }]),
  compressVideo
);

router.post("/callback", getCallback);

router.get("/", (req, res, next) => {
  res.send("ok");
});

module.exports = router;
