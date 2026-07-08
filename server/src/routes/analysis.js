import { Router } from 'express';
import Analysis from '../models/Analysis.js';
import { upload } from '../utils/upload.js';
import { extractResumeText, UnsupportedFileTypeError, EmptyTextError } from '../utils/extractText.js';
import { analyzeResume, AIAnalysisError } from '../utils/aiAnalysis.js';

const router = Router();

// POST /api/analyze
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: 'A resume file is required (field name: "resume").' });
    }

    const jobDescription = (req.body.job_description || '').trim();
    if (jobDescription.length < 30) {
      return res.status(400).json({
        detail: 'job_description must be at least 30 characters.',
      });
    }
    if (jobDescription.length > 8000) {
      return res.status(400).json({
        detail: 'job_description must be under 8000 characters.',
      });
    }

    let resumeText;
    try {
      resumeText = await extractResumeText(req.file);
    } catch (err) {
      if (err instanceof UnsupportedFileTypeError) {
        return res.status(400).json({ detail: err.message });
      }
      if (err instanceof EmptyTextError) {
        return res.status(422).json({ detail: err.message });
      }
      throw err;
    }

    let result;
    try {
      result = await analyzeResume(resumeText, jobDescription);
    } catch (err) {
      if (err instanceof AIAnalysisError) {
        return res.status(502).json({ detail: err.message });
      }
      throw err;
    }

    const analysis = await Analysis.create({
      resumeFilename: req.file.originalname,
      jobDescription,
      resumeText,
      ...result,
    });

    return res.status(201).json(analysis);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Something went wrong on the server.' });
  }
});

// GET /api/analyses — most recent 50
router.get('/analyses', async (req, res) => {
  const analyses = await Analysis.find().sort({ createdAt: -1 }).limit(50);
  res.json(analyses);
});

// GET /api/analyses/:id
router.get('/analyses/:id', async (req, res) => {
  const analysis = await Analysis.findById(req.params.id);
  if (!analysis) {
    return res.status(404).json({ detail: 'Not found.' });
  }
  res.json(analysis);
});

export default router;
