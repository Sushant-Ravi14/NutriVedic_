import mongoose from 'mongoose';

const rtiDraftSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null, // nullable for guests
  },
  applicantName: {
    type: String,
    required: true,
  },
  applicantAddress: {
    type: String,
    required: true,
  },
  formalQuestion: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  pioAddress: {
    type: String,
    required: true,
  },
  pdfGeneratedAt: {
    type: Date,
    default: null,
  }
}, { timestamps: true });

const RTIDraft = mongoose.model('RTIDraft', rtiDraftSchema);

export default RTIDraft;
