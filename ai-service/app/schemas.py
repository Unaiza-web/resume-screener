from typing import List, Optional
from pydantic import BaseModel, Field


# ---------- Resume Analysis ----------

class AnalyzeRequest(BaseModel):
    resume_text: str
    job_description: str


class AnalyzeResponse(BaseModel):
    match_score: int
    ats_score: int
    resume_score: int
    matching_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    summary: str = ''


# ---------- Interview ----------

class GenerateQuestionsRequest(BaseModel):
    resume_text: str
    job_description: str


class InterviewQuestion(BaseModel):
    question: str
    category: str = 'general'  # technical | behavioral | general


class GenerateQuestionsResponse(BaseModel):
    questions: List[InterviewQuestion]


class EvaluateAnswerRequest(BaseModel):
    question: str
    answer: str
    job_description: str


class EvaluateAnswerResponse(BaseModel):
    score: int
    feedback: str


class TranscriptItem(BaseModel):
    question: str
    category: str = 'general'
    answer: str = ''
    score: Optional[int] = None


class FinalReportRequest(BaseModel):
    questions: List[TranscriptItem]


class FinalReportResponse(BaseModel):
    overall_score: int
    communication_score: int
    technical_score: int
    confidence_score: int
    strengths: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    summary: str = ''