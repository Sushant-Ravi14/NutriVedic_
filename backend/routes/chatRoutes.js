import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', optionalAuth, handleChat);

export default router;
