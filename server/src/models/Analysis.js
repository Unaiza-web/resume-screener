import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema(
  {
    resumeFilename: { type: String, required: true },
    jobDescription: { type: String, required: true },
    resumeText: { type: String, default: '' },

    matchScore: { type: Number, min: 0, max: 100, default: 0 },
    atsScore: { type: Number, min: 0, max: 100, default: 0 },
    resumeScore: { type: Number, min: 0, max: 100, default: 0 },

    matchingSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    summary: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Analysis', analysisSchema);