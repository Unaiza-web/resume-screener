/**
 * Calls the Python AI microservice (FastAPI + Groq) to analyze a resume
 * against a job description. The actual Gen AI / LLM logic lives in
 * ../../ai-service (Python) — this file just talks to it over HTTP.
 */
export class AIAnalysisError extends Error {}

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

export async function analyzeResume(resumeText, jobDescription) {
  const data = await callService('/analyze', {
    resume_text: resumeText,
    job_description: jobDescription,
  });

  return {
    matchScore: data.match_score,
    atsScore: data.ats_score,
    resumeScore: data.resume_score,
    matchingSkills: data.matching_skills || [],
    missingSkills: data.missing_skills || [],
    strengths: data.strengths || [],
    weaknesses: data.weaknesses || [],
    suggestions: data.suggestions || [],
    summary: data.summary || '',
  };
}