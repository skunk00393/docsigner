import { PDFDocument, rgb } from "pdf-lib";
import logoUrl from "./logo.png";

export async function addPdfLogoWatermark(pdfFile, text) {
  const pdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFDocument.load(pdfBytes);

  let logoImage = null;

  try {
    const logoBytes = await fetch(logoUrl).then((r) => {
      if (!r.ok) throw new Error("Logo fetch failed");
      return r.arrayBuffer();
    });

    try {
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {
      try {
        logoImage = await pdfDoc.embedJpg(logoBytes);
      } catch (err) {
        logoImage = null;
      }
    }
  } catch (e) {
    logoImage = null;
  }

  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width } = page.getSize();

    const margin = 20;

    if (logoImage) {
      const logoWidth = Math.min(80, width / 6);
      const logoHeight = (logoImage.height / logoImage.width) * logoWidth;

      page.drawImage(logoImage, {
        x: margin,
        y: margin + 15,
        width: logoWidth,
        height: logoHeight,
        opacity: 0.8,
      });

      page.drawText(text, {
        x: margin,
        y: margin,
        size: 10,
        color: rgb(0, 0, 0),
        opacity: 0.7,
      });
    }
  }

  const newPdfBytes = await pdfDoc.save();
  return new Blob([newPdfBytes], { type: "application/pdf" });
}