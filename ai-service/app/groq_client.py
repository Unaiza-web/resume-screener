import json
import re
from typing import Any, Dict, List

from groq import Groq

from . import config


class AIAnalysisError(Exception):
    pass


_client: Groq | None = None


def get_client() -> Groq:
    if not config.GROQ_API_KEY:
        raise AIAnalysisError(
            'https://console.groq.com/keys'
        )
    global _client
    if _client is None:
        _client = Groq(api_key=config.GROQ_API_KEY)
    return _client


def extract_json(raw_text: str) -> Dict[str, Any]:
    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        match = re.search(r'\{[\s\S]*\}|\[[\s\S]*\]', raw_text)
        if not match:
            raise AIAnalysisError('The AI response was not valid JSON.')
        return json.loads(match.group(0))


def chat(system_prompt: str, user_prompt: str, max_tokens: int = 1200) -> Dict[str, Any]:
    client = get_client()
    try:
        completion = client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            temperature=0.4,
            max_tokens=max_tokens,
            response_format={'type': 'json_object'},
        )
    except Exception as exc:
        raise AIAnalysisError(f'Groq API request failed: {exc}') from exc

    raw_text = completion.choices[0].message.content or '{}'
    return extract_json(raw_text)


def _clamp_score(value: Any, lo: int = 0, hi: int = 100) -> int:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return lo
    return max(lo, min(hi, n))


def _as_string_list(value: Any) -> List[str]:
    if not isinstance(value, list):
        return []
    return [str(v) for v in value]


# ---------------------------------------------------------------------------
# Resume Analysis
# ---------------------------------------------------------------------------

ANALYSIS_SYSTEM_PROMPT = (
    "You are an expert technical recruiter and ATS (Applicant Tracking System) specialist. "
    "You compare a candidate's resume against a job description and return an honest, specific, "
    "constructive analysis. You always respond with ONLY a single valid JSON object — no markdown "
    "fences, no commentary before or after it."
)

MAX_RESUME_CHARS = 12000
MAX_JOB_DESC_CHARS = 6000


def analyze_resume(resume_text: str, job_description: str) -> Dict[str, Any]:
    resume = resume_text[:MAX_RESUME_CHARS]
    jd = job_description[:MAX_JOB_DESC_CHARS]

    user_prompt = f"""Compare this resume against this job description.

RESUME:
\"\"\"
{resume}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{jd}
\"\"\"

Return ONLY a JSON object with this exact shape (no extra keys, no markdown):
{{
  "match_score": <integer 0-100, how well the resume matches the job>,
  "ats_score": <integer 0-100, how well an ATS could parse/read this resume's formatting and structure>,
  "resume_score": <integer 0-100, overall resume quality: clarity, structure, impact, achievements — independent of any specific job>,
  "matching_skills": [<strings — skills/keywords present in both>],
  "missing_skills": [<strings — important skills from the job description missing in the resume>],
  "strengths": [<strings — 2-5 short bullet points>],
  "weaknesses": [<strings — 2-5 short bullet points>],
  "suggestions": [<strings — 3-6 concrete, actionable improvement tips>],
  "summary": "<2-3 sentence overall summary>"
}}"""

    data = chat(ANALYSIS_SYSTEM_PROMPT, user_prompt, max_tokens=1500)

    return {
        'match_score': _clamp_score(data.get('match_score')),
        'ats_score': _clamp_score(data.get('ats_score')),
        'resume_score': _clamp_score(data.get('resume_score')),
        'matching_skills': _as_string_list(data.get('matching_skills')),
        'missing_skills': _as_string_list(data.get('missing_skills')),
        'strengths': _as_string_list(data.get('strengths')),
        'weaknesses': _as_string_list(data.get('weaknesses')),
        'suggestions': _as_string_list(data.get('suggestions')),
        'summary': str(data.get('summary', ''))[:1000],
    }


# ---------------------------------------------------------------------------
# Interview
# ---------------------------------------------------------------------------

def generate_questions(resume_text: str, job_description: str) -> List[Dict[str, str]]:
    system_prompt = (
        "You are an experienced technical interviewer. You write sharp, specific interview "
        "questions grounded in the candidate's actual resume and the job description — never "
        "generic filler questions. Respond with ONLY a JSON object, no markdown."
    )

    user_prompt = f"""Based on this resume and job description, write exactly 5 interview questions:
- 3 technical/role-specific questions (reference actual skills/projects from the resume where possible)
- 2 behavioral questions (teamwork, problem-solving, growth)

RESUME:
\"\"\"
{resume_text[:8000]}
\"\"\"

JOB DESCRIPTION:
\"\"\"
{job_description[:4000]}
\"\"\"

Return ONLY:
{{
  "questions": [
    {{ "question": "...", "category": "technical" }},
    {{ "question": "...", "category": "technical" }},
    {{ "question": "...", "category": "technical" }},
    {{ "question": "...", "category": "behavioral" }},
    {{ "question": "...", "category": "behavioral" }}
  ]
}}"""

    data = chat(system_prompt, user_prompt, max_tokens=1200)
    raw_questions = data.get('questions', [])
    if not isinstance(raw_questions, list):
        raw_questions = []

    questions = []
    for q in raw_questions:
        if not isinstance(q, dict) or not q.get('question'):
            continue
        category = q.get('category')
        if category not in ('technical', 'behavioral'):
            category = 'general'
        questions.append({'question': str(q['question']), 'category': category})

    return questions


def evaluate_answer(question: str, answer: str, job_description: str) -> Dict[str, Any]:
    system_prompt = (
        "You are a fair, encouraging technical interviewer evaluating a candidate's spoken/typed "
        "answer. Respond with ONLY a JSON object, no markdown."
    )

    user_prompt = f"""Question: "{question}"
Candidate's answer: "{answer[:3000]}"
Job context: "{job_description[:1500]}"

Evaluate this answer. Return ONLY:
{{
  "score": <integer 0-10>,
  "feedback": "<1-2 sentence constructive feedback>"
}}"""

    data = chat(system_prompt, user_prompt, max_tokens=300)

    return {
        'score': _clamp_score(data.get('score'), lo=0, hi=10),
        'feedback': str(data.get('feedback', ''))[:500],
    }


def generate_final_report(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    answered = [q for q in questions if q.get('answer') and str(q['answer']).strip()]

    transcript = '\n\n'.join(
        f"Q{i + 1} ({q.get('category', 'general')}): {q['question']}\n"
        f"Answer: {q.get('answer', '')}\n"
        f"Score: {q.get('score')}/10"
        for i, q in enumerate(answered)
    )

    system_prompt = (
        "You are a hiring manager summarizing a completed interview. Respond with ONLY a JSON "
        "object, no markdown."
    )

    user_prompt = f"""Here is the full interview transcript with per-question scores:

{transcript}

Write a final report. Return ONLY:
{{
  "overall_score": <integer 0-100, weighted overall performance>,
  "communication_score": <integer 0-100, clarity and structure of how answers were communicated>,
  "technical_score": <integer 0-100, depth and correctness of technical/role-specific answers>,
  "confidence_score": <integer 0-100, how confident and decisive the answers sounded>,
  "strengths": [<2-4 short strings>],
  "improvements": [<2-4 short strings>],
  "summary": "<3-4 sentence overall summary of the candidate's performance>"
}}"""

    data = chat(system_prompt, user_prompt, max_tokens=800)

    return {
        'overall_score': _clamp_score(data.get('overall_score')),
        'communication_score': _clamp_score(data.get('communication_score')),
        'technical_score': _clamp_score(data.get('technical_score')),
        'confidence_score': _clamp_score(data.get('confidence_score')),
        'strengths': _as_string_list(data.get('strengths')),
        'improvements': _as_string_list(data.get('improvements')),
        'summary': str(data.get('summary', '')),
    }