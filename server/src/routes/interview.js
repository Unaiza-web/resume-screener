import { Router } from 'express';
import Interview from '../models/Interview.js';
import { upload } from '../utils/upload.js';
import { extractResumeText, UnsupportedFileTypeError, EmptyTextError } from '../utils/extractText.js';
import { AIAnalysisError } from '../utils/aiAnalysis.js';
import { generateQuestions, evaluateAnswer, generateFinalReport } from '../utils/interviewAI.js';

const router = Router();

function currentQuestionPayload(interview) {
  if (interview.status === 'completed') return null;
  const q = interview.questions[interview.currentIndex];
  if (!q) return null;
  return {
    index: interview.currentIndex,
    total: interview.questions.length,
    question: q.question,
    category: q.category,
  };
}

// POST /api/interview/start
// multipart/form-data: resume (file, optional if resumeText already known),
// job_description (text), mode ("text" | "voice")
router.post('/start', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = (req.body.job_description || '').trim();
    const mode = req.body.mode === 'voice' ? 'voice' : 'text';

    if (jobDescription.length < 30) {
      return res.status(400).json({ detail: 'job_description must be at least 30 characters.' });
    }

    let resumeText = (req.body.resume_text || '').trim();
    let resumeFilename = req.body.resume_filename || '';

    if (!resumeText && req.file) {
      try {
        resumeText = await extractResumeText(req.file);
        resumeFilename = req.file.originalname;
      } catch (err) {
        if (err instanceof UnsupportedFileTypeError) {
          return res.status(400).json({ detail: err.message });
        }
        if (err instanceof EmptyTextError) {
          return res.status(422).json({ detail: err.message });
        }
        throw err;
      }
    }

    if (!resumeText) {
      return res.status(400).json({
        detail: 'A resume file (field "resume") or resume_text is required.',
      });
    }

    let questions;
    try {
      questions = await generateQuestions(resumeText, jobDescription);
    } catch (err) {
      if (err instanceof AIAnalysisError) {
        return res.status(502).json({ detail: err.message });
      }
      throw err;
    }

    if (!questions.length) {
      return res.status(502).json({ detail: 'Could not generate interview questions. Please try again.' });
    }

    const interview = await Interview.create({
      resumeFilename,
      jobDescription,
      resumeText,
      mode,
      questions,
    });

    return res.status(201).json({
      interviewId: interview._id,
      mode: interview.mode,
      ...currentQuestionPayload(interview),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Something went wrong on the server.' });
  }
});

// POST /api/interview/:id/answer  { answer: string }
router.post('/:id/answer', async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ detail: 'Interview not found.' });
    if (interview.status === 'completed') {
      return res.status(400).json({ detail: 'This interview is already completed.' });
    }

    const answer = (req.body.answer || '').trim();
    if (!answer) {
      return res.status(400).json({ detail: 'answer is required.' });
    }

    const q = interview.questions[interview.currentIndex];
    if (!q) return res.status(400).json({ detail: 'No active question.' });

    let evaluation;
    try {
      evaluation = await evaluateAnswer(q.question, answer, interview.jobDescription);
    } catch (err) {
      if (err instanceof AIAnalysisError) {
        return res.status(502).json({ detail: err.message });
      }
      throw err;
    }

    q.answer = answer;
    q.score = evaluation.score;
    q.feedback = evaluation.feedback;
    interview.currentIndex += 1;

    const isLast = interview.currentIndex >= interview.questions.length;

    if (isLast) {
      let report;
      try {
        report = await generateFinalReport(interview);
      } catch (err) {
        if (err instanceof AIAnalysisError) {
          return res.status(502).json({ detail: err.message });
        }
        throw err;
      }
      interview.status = 'completed';
      interview.overallScore = report.overallScore;
      interview.strengths = report.strengths;
      interview.improvements = report.improvements;
      interview.summary = report.summary;
    }

    await interview.save();

    return res.json({
      questionScore: evaluation.score,
      questionFeedback: evaluation.feedback,
      completed: interview.status === 'completed',
      next: currentQuestionPayload(interview),
      report:
        interview.status === 'completed'
          ? {
              overallScore: interview.overallScore,
              strengths: interview.strengths,
              improvements: interview.improvements,
              summary: interview.summary,
              questions: interview.questions,
            }
          : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ detail: 'Something went wrong on the server.' });
  }
});

// GET /api/interview/:id
router.get('/:id', async (req, res) => {
  const interview = await Interview.findById(req.params.id);
  if (!interview) return res.status(404).json({ detail: 'Interview not found.' });
  res.json(interview);
});

export default router;