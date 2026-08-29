import express from 'express';
import { draftRti, generatePdf } from '../controllers/rtiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/draft', optionalAuth, draftRti);
router.post('/generate-pdf', optionalAuth, generatePdf);

export default router;
