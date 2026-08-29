import asyncHandler from 'express-async-handler';
import { generateRtiDraft } from '../services/geminiService.js';
import { generateRtiPdf } from '../services/pdfService.js';
import RTIDraft from '../models/RTIDraft.js';

export const draftRti = asyncHandler(async (req, res) => {
  const { plainQuestion, knownDepartment } = req.body;
  const draft = await generateRtiDraft(plainQuestion, knownDepartment);
  res.json(draft);
});

export const generatePdf = asyncHandler(async (req, res) => {
  const { applicantName, applicantAddress, formalQuestion, department, pioAddress } = req.body;
  const user = req.user ? req.user._id : null;

  const pdfBytes = await generateRtiPdf({
    applicantName,
    applicantAddress,
    formalQuestion,
    department,
    pioAddress
  });

  if (user) {
    await RTIDraft.create({
      user,
      applicantName,
      applicantAddress,
      formalQuestion,
      department,
      pioAddress,
      pdfGeneratedAt: new Date()
    });
  }

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename=rti_application.pdf',
    'Content-Length': pdfBytes.length,
  });

  res.send(Buffer.from(pdfBytes));
});
