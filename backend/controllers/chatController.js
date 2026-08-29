import asyncHandler from 'express-async-handler';
import ChatSession from '../models/ChatSession.js';
import { generateChatResponse } from '../services/geminiService.js';
import { CATEGORIES } from '../constants/categories.js';

export const handleChat = asyncHandler(async (req, res) => {
  const { message, category, history } = req.body;
  const user = req.user ? req.user._id : null;

  if (!CATEGORIES.includes(category)) {
    res.status(400);
    throw new Error('Invalid category');
  }

  // Get AI response
  const aiResponse = await generateChatResponse(message, category, history);

  // If user is logged in, optionally save the session logic could go here
  // But wait, the history logic suggests we might want to save the session
  // If it's a new session or continuation
  if (user) {
    // Basic approach: we don't have session IDs passed from client in prompt,
    // so we'll just create a new session per interaction for simplicity, 
    // or you could expand this to maintain session IDs.
    const chatSession = await ChatSession.create({
      user,
      category,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      ]
    });
  }

  res.json(aiResponse);
});
