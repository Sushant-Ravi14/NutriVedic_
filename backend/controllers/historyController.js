import asyncHandler from 'express-async-handler';
import ChatSession from '../models/ChatSession.js';
import RTIDraft from '../models/RTIDraft.js';

export const getHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const chatSessions = await ChatSession.find({ user: userId }).sort({ createdAt: -1 });
  const rtiDrafts = await RTIDraft.find({ user: userId }).sort({ createdAt: -1 });

  res.json({
    chatSessions,
    rtiDrafts
  });
});
