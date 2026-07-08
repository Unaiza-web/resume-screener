import mongoose from 'mongoose';

const qaSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    category: { type: String, default: 'general' },
    answer: { type: String, default: '' },
    score: { type: Number, min: 0, max: 10, default: null },
    feedback: { type: String, default: '' },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    resumeFilename: { type: String, default: '' },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, default: '' },
    mode: { type: String, enum: ['text', 'voice'], default: 'text' },

    questions: { type: [qaSchema], default: [] },
    currentIndex: { type: Number, default: 0 },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },

    overallScore: { type: Number, min: 0, max: 100, default: null },
    communicationScore: { type: Number, min: 0, max: 100, default: null },
    technicalScore: { type: Number, min: 0, max: 100, default: null },
    confidenceScore: { type: Number, min: 0, max: 100, default: null },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);