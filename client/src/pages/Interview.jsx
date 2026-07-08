import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { speak, stopSpeaking, useSpeechToText } from '../hooks/useSpeech';
import {
  PDF,
  MARGIN,
  CONTENT_W,
  addWatermark,
  addHeader,
  addFooter,
  ensureSpace,
  scoreBox,
  scoreColor,
  sectionTitle,
  bulletList,
  calloutBox,
  paragraph,
} from '../utils/pdfReport';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_MB = 10;
const QUESTION_SECONDS = 120;

function ScoreRing({ score, size = 96, label }) {
  const color = score >= 75 ? '#9E8B90' : score >= 50 ? '#AD6F6F' : '#DC2626';
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="8" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#1F2937]">{score}%</span>
        </div>
      </div>
      {label && <span className="mt-2 text-sm font-medium text-[#374151] text-center">{label}</span>}
    </div>
  );
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function downloadInterviewReport(report) {
  const doc = new jsPDF();
  const pageNumRef = { n: 1 };
  const x = MARGIN;
  const w = CONTENT_W;

  addWatermark(doc);
  let y = addHeader(doc, 'AI Interview Report', 'Scored evaluation of your mock interview performance');
  addFooter(doc, pageNumRef.n);

  const boxW = (w - 6) / 2;
  const boxH = 26;
  scoreBox(doc, x, y, boxW, boxH, 'Overall Score', report.overallScore, scoreColor(report.overallScore));
  scoreBox(doc, x + boxW + 6, y, boxW, boxH, 'Communication', report.communicationScore, scoreColor(report.communicationScore));
  y += boxH + 6;
  scoreBox(doc, x, y, boxW, boxH, 'Technical', report.technicalScore, scoreColor(report.technicalScore));
  scoreBox(doc, x + boxW + 6, y, boxW, boxH, 'Confidence', report.confidenceScore, scoreColor(report.confidenceScore));
  y += boxH + 10;

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Summary', x, y);
  y = calloutBox(doc, report.summary || 'No summary available.', x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Strengths', x, y, PDF.primaryDark);
  y = bulletList(doc, report.strengths, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Areas to Improve', x, y, PDF.secondaryDark);
  y = bulletList(doc, report.improvements, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Question-by-Question Breakdown', x, y);

  (report.questions || [])
    .filter((q) => q.answer)
    .forEach((q, i) => {
      y = ensureSpace(doc, y, 26, pageNumRef);

      doc.setFillColor(...PDF.lightBg);
      doc.setDrawColor(...PDF.border);
      doc.setLineWidth(0.4);
      const qLines = doc.splitTextToSize(`Q${i + 1}: ${q.question}`, w - 24);
      const fLines = doc.splitTextToSize(q.feedback || '', w - 12);
      const boxH2 = (qLines.length + fLines.length) * 5 + 12;
      doc.roundedRect(x, y, w, boxH2, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...PDF.dark);
      doc.text(qLines, x + 5, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...PDF.secondaryDark);
      doc.text(`${q.score ?? '-'}/10`, x + w - 5, y + 7, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...PDF.gray);
      doc.text(fLines, x + 5, y + 7 + qLines.length * 5 + 3);

      y += boxH2 + 5;
    });

  doc.save('interview-report.pdf');
}

export default function Interview() {
  const location = useLocation();
  const passed = location.state || {};

  const [phase, setPhase] = useState('setup');
  const [mode, setMode] = useState(null);

  const [file, setFile] = useState(passed.file || null);
  const [jobDesc, setJobDesc] = useState(passed.jobDescription || '');
  const [setupError, setSetupError] = useState('');
  const [starting, setStarting] = useState(false);

  const [interviewId, setInterviewId] = useState(null);
  const [current, setCurrent] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [lastFeedback, setLastFeedback] = useState(null);
  const [report, setReport] = useState(null);
  const [apiError, setApiError] = useState('');
  const [timeLeft, setTimeLeft] = useState(QUESTION_SECONDS);

  const fileInputRef = useRef(null);
  const speech = useSpeechToText();

  const canStart = !!file && jobDesc.trim().length >= 30 && !!mode && !starting;

  const handleFile = (files) => {
    const f = files && files[0];
    if (!f) return;
    const okType = /\.(pdf|docx)$/i.test(f.name);
    const okSize = f.size <= MAX_MB * 1024 * 1024;
    if (!okType) return setSetupError('Please upload a PDF or DOCX file.');
    if (!okSize) return setSetupError(`File must be under ${MAX_MB} MB.`);
    setSetupError('');
    setFile(f);
  };

  const startInterview = async () => {
    if (!canStart) return;
    setStarting(true);
    setSetupError('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDesc.trim());
    formData.append('mode', mode);

    try {
      const res = await fetch(`${API_URL}/api/interview/start`, { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not start the interview.');

      setInterviewId(data.interviewId);
      setCurrent({ index: data.index, total: data.total, question: data.question, category: data.category });
      setTimeLeft(QUESTION_SECONDS);
      setPhase('interview');

      if (mode === 'voice') {
        setTimeout(() => speak(data.question), 300);
      }
    } catch (err) {
      setSetupError(
        err.message === 'Failed to fetch'
          ? 'Could not reach the backend. Make sure the server is running at ' + API_URL
          : err.message
      );
    } finally {
      setStarting(false);
    }
  };

  const currentAnswer = mode === 'voice' ? speech.transcript : typedAnswer;

  useEffect(() => {
    if (phase !== 'interview') return;
    setTimeLeft(QUESTION_SECONDS);
    const t = setInterval(() => setTimeLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase, current?.index]);

  const submitAnswer = async () => {
    const answer = currentAnswer.trim();
    if (!answer || submitting) return;

    setSubmitting(true);
    setApiError('');
    if (mode === 'voice') speech.stop();
    stopSpeaking();

    try {
      const res = await fetch(`${API_URL}/api/interview/${interviewId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not submit your answer.');

      setLastFeedback({ score: data.questionScore, feedback: data.questionFeedback });
      setTypedAnswer('');
      speech.reset();

      if (data.completed) {
        setReport(data.report);
        setPhase('report');
      } else {
        setCurrent(data.next);
        if (mode === 'voice') {
          setTimeout(() => speak(data.next.question), 600);
        }
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const endInterview = async () => {
    if (ending || !interviewId) return;
    setEnding(true);
    setApiError('');
    stopSpeaking();
    if (mode === 'voice') speech.stop();

    try {
      const res = await fetch(`${API_URL}/api/interview/${interviewId}/end`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not end the interview.');
      setReport(data.report);
      setPhase('report');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setEnding(false);
    }
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  if (phase === 'setup') {
    return (
      <main className="max-w-3xl mx-auto px-6 py-14 bg-white">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">AI Interview</h1>
        <p className="mt-2 text-[#6B7280]">
          Practice a real interview for this role. The AI asks questions based on your resume and the
          job description, then gives you a scored report at the end.
        </p>

        <div className="mt-8 ui-card p-6">
          <h2 className="font-semibold text-[#1F2937]">1. Resume</h2>
          {file ? (
            <p className="mt-2 text-sm text-[#9E8B90] font-medium">{file.name}</p>
          ) : (
            <p className="mt-2 text-sm text-[#6B7280]">No resume selected yet.</p>
          )}
          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="focus-ring mt-3 text-sm font-medium text-[#1F2937] bg-[#F8FAFC] hover:bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-2 transition-colors"
          >
            {file ? 'Change file' : 'Upload resume (PDF or DOCX)'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files)}
          />
        </div>

        <div className="mt-6 ui-card p-6">
          <h2 className="font-semibold text-[#1F2937]">2. Job Description</h2>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here..."
            className="focus-ring mt-3 w-full h-32 resize-none rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#9E8B90]"
          />
        </div>

        <div className="mt-6 ui-card p-6">
          <h2 className="font-semibold text-[#1F2937]">3. Interview Mode</h2>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <button
              onClick={() => setMode('text')}
              className={`focus-ring text-left rounded-xl border p-4 transition-colors ${
                mode === 'text' ? 'border-[#9E8B90] bg-[#ECE7E8]' : 'border-[#E5E7EB] hover:border-[#9E8B90]/40'
              }`}
            >
              <span className="text-2xl">📝</span>
              <p className="mt-2 font-semibold text-[#1F2937]">Text Chat Interview</p>
              <p className="mt-1 text-xs text-[#6B7280]">Type your answers. Works everywhere.</p>
            </button>
            <button
              onClick={() => setMode('voice')}
              className={`focus-ring text-left rounded-xl border p-4 transition-colors ${
                mode === 'voice' ? 'border-[#AD6F6F] bg-[#F3E3E3]' : 'border-[#E5E7EB] hover:border-[#AD6F6F]/40'
              }`}
            >
              <span className="text-2xl">🎤</span>
              <p className="mt-2 font-semibold text-[#1F2937]">Voice Interview</p>
              <p className="mt-1 text-xs text-[#6B7280]">Speak your answers. Best in Chrome/Edge.</p>
            </button>
          </div>
          {mode === 'voice' && !speech.supported && (
            <p className="mt-3 text-sm text-amber-600">
              Your browser doesn't support voice recognition. Try Chrome or Edge, or pick Text Chat instead.
            </p>
          )}
        </div>

        {setupError && <p className="mt-4 text-sm text-red-600">{setupError}</p>}

        <div className="mt-8 flex justify-end">
          <button
            onClick={startInterview}
            disabled={!canStart}
            className="focus-ring btn-primary disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            {starting ? 'Preparing questions...' : 'Start Interview'}
          </button>
        </div>
      </main>
    );
  }

  if (phase === 'interview' && current) {
    const timeUp = timeLeft === 0;
    return (
      <main className="max-w-3xl mx-auto px-6 py-14 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1F2937]">AI Interview</h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-mono px-2.5 py-1 rounded-lg ${
                timeUp ? 'bg-red-50 text-red-600' : 'bg-[#F8FAFC] text-[#374151]'
              }`}
            >
              ⏱ {formatTime(timeLeft)}
            </span>
            <span className="text-sm text-[#6B7280]">
              Question {current.index + 1} of {current.total}
            </span>
          </div>
        </div>

        <div className="mt-3 w-full h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
          <div
            className="h-full bg-[#9E8B90] transition-all duration-500"
            style={{ width: `${(current.index / current.total) * 100}%` }}
          />
        </div>

        {lastFeedback && (
          <div className="mt-6 bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-4">
            <p className="text-xs font-medium text-[#6B7280]">Previous answer &middot; {lastFeedback.score}/10</p>
            <p className="mt-1 text-sm text-[#374151]">{lastFeedback.feedback}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <span className="shrink-0 w-8 h-8 rounded-full bg-[#9E8B90] text-white text-xs font-bold flex items-center justify-center">AI</span>
          <div className="ui-card p-5 flex-1">
            <span className="text-xs font-medium uppercase tracking-wide text-[#9E8B90]">{current.category}</span>
            <p className="mt-2 text-base font-semibold text-[#1F2937] leading-snug">{current.question}</p>
            {mode === 'voice' && (
              <button
                onClick={() => speak(current.question)}
                className="focus-ring mt-3 text-xs text-[#6B7280] hover:text-[#9E8B90] inline-flex items-center gap-1"
              >
                🔊 Replay question
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <div className="ui-card p-5 flex-1 bg-[#F8FAFC]">
            {mode === 'text' ? (
              <textarea
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="focus-ring w-full h-32 resize-none rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#1F2937] placeholder:text-[#9CA3AF] outline-none focus:border-[#9E8B90]"
              />
            ) : (
              <div>
                <div className="min-h-24 rounded-xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#1F2937]">
                  {speech.transcript || (
                    <span className="text-[#9CA3AF]">
                      {speech.listening ? 'Listening...' : 'Press the mic and start speaking.'}
                    </span>
                  )}
                </div>
                {speech.error && <p className="mt-2 text-sm text-red-600">{speech.error}</p>}
                <button
                  onClick={speech.listening ? speech.stop : speech.start}
                  disabled={!speech.supported}
                  className={`focus-ring mt-3 inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-40 ${
                    speech.listening
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : 'bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#9E8B90]'
                  }`}
                >
                  {speech.listening ? '⏹ Stop recording' : '🎤 Start speaking'}
                </button>
              </div>
            )}

            {apiError && <p className="mt-3 text-sm text-red-600">{apiError}</p>}

            <div className="mt-4 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={endInterview}
                disabled={ending}
                className="focus-ring text-sm font-medium text-[#6B7280] hover:text-red-600 transition-colors disabled:opacity-50"
              >
                {ending ? 'Ending...' : 'End Interview'}
              </button>
              <button
                onClick={submitAnswer}
                disabled={!currentAnswer.trim() || submitting}
                className="focus-ring btn-primary disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed text-sm font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                {submitting ? 'Evaluating...' : 'Next Question →'}
              </button>
            </div>
          </div>
          <span className="shrink-0 w-8 h-8 rounded-full bg-[#AD6F6F] text-white text-xs font-bold flex items-center justify-center">You</span>
        </div>
      </main>
    );
  }

  if (phase === 'report' && report) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-14 bg-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937]">Interview Report</h1>
            <p className="mt-2 text-[#6B7280]">Here's how you did.</p>
          </div>
          <button
            onClick={() => downloadInterviewReport(report)}
            className="focus-ring inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#9E8B90] text-[#1F2937] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
            </svg>
            Download PDF
          </button>
        </div>

        <div className="mt-8 ui-card p-6">
          <div className="grid sm:grid-cols-4 gap-6">
            <ScoreRing score={report.overallScore} label="Overall" size={100} />
            <ScoreRing score={report.communicationScore} label="Communication" />
            <ScoreRing score={report.technicalScore} label="Technical" />
            <ScoreRing score={report.confidenceScore} label="Confidence" />
          </div>
          <p className="mt-6 text-sm text-[#374151] leading-relaxed border-t border-[#E5E7EB] pt-5">{report.summary}</p>
        </div>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="ui-card p-6">
            <h3 className="font-semibold text-[#1F2937] mb-3">Strengths</h3>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="text-sm text-[#374151]">✅ {s}</li>
              ))}
            </ul>
          </div>
          <div className="ui-card p-6">
            <h3 className="font-semibold text-[#1F2937] mb-3">Areas to Improve</h3>
            <ul className="space-y-2">
              {report.improvements.map((s, i) => (
                <li key={i} className="text-sm text-[#374151]">💡 {s}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-[#1F2937]">Question-by-Question Breakdown</h3>
          {report.questions.filter((q) => q.answer).map((q, i) => (
            <div key={i} className="ui-card p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-medium text-[#1F2937]">{q.question}</p>
                <span className="shrink-0 text-xs font-semibold text-[#9E8B90]">{q.score}/10</span>
              </div>
              <p className="mt-2 text-xs text-[#6B7280]">{q.feedback}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={() => window.location.reload()}
            className="focus-ring bg-white border border-[#E5E7EB] hover:border-[#9E8B90] text-[#1F2937] text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Start a New Interview
          </button>
        </div>
      </main>
    );
  }

  return null;
}