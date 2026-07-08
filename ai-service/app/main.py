from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import config
from .groq_client import (
    AIAnalysisError,
    analyze_resume,
    evaluate_answer,
    generate_final_report,
    generate_questions,
)
from .schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    FinalReportRequest,
    FinalReportResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
)

app = FastAPI(title="AI Resume Screener — AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"status": "ok", "service": "ai-service"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    try:
        result = analyze_resume(req.resume_text, req.job_description)
    except AIAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return result


@app.post("/interview/questions", response_model=GenerateQuestionsResponse)
def interview_questions(req: GenerateQuestionsRequest):
    try:
        questions = generate_questions(req.resume_text, req.job_description)
    except AIAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    if not questions:
        raise HTTPException(status_code=502, detail="Could not generate interview questions.")
    return {"questions": questions}


@app.post("/interview/evaluate", response_model=EvaluateAnswerResponse)
def interview_evaluate(req: EvaluateAnswerRequest):
    try:
        result = evaluate_answer(req.question, req.answer, req.job_description)
    except AIAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return result


@app.post("/interview/report", response_model=FinalReportResponse)
def interview_report(req: FinalReportRequest):
    try:
        result = generate_final_report([q.model_dump() for q in req.questions])
    except AIAnalysisError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return result