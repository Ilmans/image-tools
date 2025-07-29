const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.convertImagesToPDF = async (files) => {
  const doc = new PDFDocument({ autoFirstPage: false });
  const outputPath = path.join(
    __dirname,
    "..",
    "uploads",
    `output-${Date.now()}.pdf`
  );
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  for (let file of files) {
    const { path: filePath } = file;
    const img = doc.openImage(filePath);
    doc.addPage({ size: [img.width, img.height] });
    doc.image(filePath, 0, 0);
  }

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => resolve(outputPath));
  });
};
