const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { convertImagesToPDF } = require("../utils/imageToPdf");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/convert", upload.array("images"), async (req, res) => {
  const files = req.files;
  const pdfPath = await convertImagesToPDF(files);

  res.download(pdfPath, "converted.pdf", () => {
    fs.unlinkSync(pdfPath);
    files.forEach((f) => fs.unlinkSync(f.path));
  });
});

module.exports = router;
