import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { DISCLAIMER_TEXT } from '../constants/disclaimer.js';

export const generateRtiPdf = async (data) => {
  const { applicantName, applicantAddress, formalQuestion, department, pioAddress } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  const { width, height } = page.getSize();
  let yPosition = height - 50;

  const drawText = (text, customFont = font, size = 12, x = 50) => {
    page.drawText(text, { x, y: yPosition, size, font: customFont, color: rgb(0, 0, 0) });
    yPosition -= (size + 5);
  };

  drawText('APPLICATION UNDER RIGHT TO INFORMATION ACT, 2005', boldFont, 16);
  yPosition -= 20;

  drawText(`To,`, font, 12);
  drawText(`The Public Information Officer (PIO),`, boldFont, 12);
  drawText(department, font, 12);
  
  // Handle multi-line addresses roughly
  const pioAddressLines = pioAddress.split('\n');
  pioAddressLines.forEach(line => drawText(line, font, 12));
  
  yPosition -= 20;

  drawText(`1. Name of the Applicant: ${applicantName}`, boldFont, 12);
  yPosition -= 10;
  
  drawText(`2. Address of the Applicant:`, boldFont, 12);
  const applicantAddressLines = applicantAddress.split('\n');
  applicantAddressLines.forEach(line => drawText(line, font, 12, 70));
  
  yPosition -= 20;

  drawText(`3. Particulars of information required:`, boldFont, 12);
  yPosition -= 10;
  
  // Wrap formal question text to avoid overflow
  const words = formalQuestion.split(' ');
  let currentLine = '';
  words.forEach(word => {
    const testLine = currentLine + word + ' ';
    const textWidth = font.widthOfTextAtSize(testLine, 12);
    if (textWidth > width - 100) {
      drawText(currentLine, font, 12, 70);
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) drawText(currentLine, font, 12, 70);

  yPosition -= 40;
  drawText(`Place: _________________`, font, 12);
  drawText(`Date: _________________`, font, 12);
  yPosition -= 40;
  drawText(`Signature of Applicant: _________________`, font, 12);

  // Footer Disclaimer
  yPosition = 30;
  drawText(DISCLAIMER_TEXT, font, 8, 50);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};
