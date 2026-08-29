import mongoose from 'mongoose';
import { CATEGORIES } from '../constants/categories.js';

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // String for user, Object for assistant
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // nullable for guests
  },
  category: {
    type: String,
    enum: ["tenant", "consumer", "workplace"],
    required: true,
  },
  messages: [messageSchema],
}, { timestamps: true });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;
