// // utils/watermarkUtils.js
const { PDFDocument, StandardFonts, rgb, degrees } = require('pdf-lib');

async function addWatermark(pdfBuffer, watermarkText) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawText(watermarkText, {
                x: width / 2 - 150,
                y: height / 2,
                size: 50,
                font: font,
                color: rgb(0.8, 0.8, 0.8),
                opacity: 0.3,
                rotate: degrees(45), // Using degrees() instead of Math.PI/4
            });
        }

        return await pdfDoc.save();
    } catch (error) {
        console.error('Error adding watermark:', error);
        throw error;
    }
}

module.exports = { addWatermark };



