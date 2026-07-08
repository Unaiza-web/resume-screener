/**
 * Calls the Python AI microservice (FastAPI + Groq) for everything
 * interview-related: question generation, answer evaluation, and the
 * final report. See ../../ai-service (Python) for the actual AI logic.
 */
import { AIAnalysisError } from './aiAnalysis.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

async function callService(path, body) {
  let res;
  try {
    res = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new AIAnalysisError(
      `Could not reach the AI service at ${AI_SERVICE_URL}. Make sure it's running (see ai-service/README.md). (${err.message})`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((d) => d.msg).join(', ')
      : data.detail || `AI service returned ${res.status}`;
    throw new AIAnalysisError(detail);
  }

  return data;
}

export async function generateQuestions(resumeText, jobDescription) {
  const data = await callService('/interview/questions', {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return (data.questions || []).map((q) => ({
    question: q.question,
    category: q.category,
  }));
}

export async function evaluateAnswer(question, answer, jobDescription) {
  const data = await callService('/interview/evaluate', {
    question,
    answer,
    job_description: jobDescription,
  });
  return { score: data.score, feedback: data.feedback };
}

export async function generateFinalReport(interview) {
  const questions = interview.questions.map((q) => ({
    question: q.question,
    category: q.category,
    answer: q.answer,
    score: q.score,
  }));

  const data = await callService('/interview/report', { questions });

  return {
    overallScore: data.overall_score,
    communicationScore: data.communication_score,
    technicalScore: data.technical_score,
    confidenceScore: data.confidence_score,
    strengths: data.strengths || [],
    improvements: data.improvements || [],
    summary: data.summary || '',
  };
}