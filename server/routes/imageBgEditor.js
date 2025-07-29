const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const sharp = require("sharp");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const REMOVE_BG_API_KEY = "aknnfZEsdkpi8y643iskb7XC";

// Fungsi hapus background pakai API remove.bg
async function removeBackgroundAPI(imagePath) {
  const imageData = fs.readFileSync(imagePath);

  const response = await axios({
    method: "post",
    url: "https://api.remove.bg/v1.0/removebg",
    data: imageData,
    responseType: "arraybuffer",
    headers: {
      "X-Api-Key": REMOVE_BG_API_KEY,
      "Content-Type": "application/octet-stream",
    },
  });

  return Buffer.from(response.data);
}

// Fungsi tambah background baru: warna atau gambar
async function addBackground(
  transparentBuffer,
  bgType,
  bgValue, // bgColor string atau bgImage path
  outputPath
) {
  const fg = sharp(transparentBuffer).ensureAlpha();
  const metadata = await fg.metadata();

  let bg;
  if (bgType === "color") {
    bg = sharp({
      create: {
        width: metadata.width,
        height: metadata.height,
        channels: 4,
        background: bgValue,
      },
    });
  } else if (bgType === "image") {
    bg = sharp(bgValue).resize(metadata.width, metadata.height, {
      fit: "cover",
    });
  } else {
    throw new Error("Invalid background type");
  }

  await bg
    .composite([{ input: await fg.toBuffer() }])
    .png()
    .toFile(outputPath);
}

router.post(
  "/remove",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "bgImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files;
      if (!files || !files.image) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const imageFile = files.image[0];
      const bgType = req.body.bgType || "color";
      const bgColor = req.body.bgColor || "#000000";

      // 1. Remove background via API
      const removedBgBuffer = await removeBackgroundAPI(imageFile.path);

      // 2. Tentukan output path
      const finalOutputPath = path.join(
        __dirname,
        "..",
        "uploads",
        `final-${imageFile.filename}.png`
      );

      // 3. Add background baru
      if (bgType === "color") {
        await addBackground(removedBgBuffer, "color", bgColor, finalOutputPath);
      } else if (bgType === "image") {
        if (!files.bgImage) {
          return res
            .status(400)
            .json({ error: "Background image file is required" });
        }
        const bgImageFile = files.bgImage[0];
        await addBackground(
          removedBgBuffer,
          "image",
          bgImageFile.path,
          finalOutputPath
        );
      } else {
        return res.status(400).json({ error: "Invalid background type" });
      }

      // Kirim hasil file
      res.sendFile(finalOutputPath, (err) => {
        // Bersihkan file sementara
        fs.unlinkSync(imageFile.path);
        fs.unlinkSync(finalOutputPath);
        if (files.bgImage) fs.unlinkSync(files.bgImage[0].path);
        if (err) console.error(err);
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to process image" });
    }
  }
);

module.exports = router;
