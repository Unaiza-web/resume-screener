import { jsPDF } from 'jspdf';
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
} from '../utils/pdfReport';

function ScoreRing({ label, score }) {
  const color = score >= 75 ? '#9E8B90' : score >= 50 ? '#AD6F6F' : '#DC2626';
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 96 96" className="w-24 h-24 -rotate-90">
          <circle cx="48" cy="48" r="38" fill="none" stroke="#F3F4F6" strokeWidth="9" />
          <circle
            cx="48"
            cy="48"
            r="38"
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[#1F2937]">{score}%</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-[#374151] text-center">{label}</span>
    </div>
  );
}

function SkillChips({ items, tone }) {
  const styles =
    tone === 'good'
      ? 'bg-[#ECE7E8] text-[#9E8B90] border-[#E5DCDD]'
      : 'bg-[#F3E3E3] text-[#8F5A5A] border-[#E9D9DE]';

  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7280]">None found.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles}`}>
          {s}
        </span>
      ))}
    </div>
  );
}

function BulletList({ items, icon }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-[#6B7280]">Nothing to show.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
          <span className="mt-1 shrink-0 text-[#9E8B90]">{icon}</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

function downloadReport(result) {
  const doc = new jsPDF();
  const pageNumRef = { n: 1 };
  const x = MARGIN;
  const w = CONTENT_W;

  addWatermark(doc);
  let y = addHeader(doc, 'Resume Analysis Report', 'AI-powered evaluation against the target job description');
  addFooter(doc, pageNumRef.n);

  const boxW = (w - 12) / 3;
  const boxH = 26;
  scoreBox(doc, x, y, boxW, boxH, 'Matching %', result.matchScore, scoreColor(result.matchScore));
  scoreBox(doc, x + boxW + 6, y, boxW, boxH, 'ATS Score', result.atsScore, scoreColor(result.atsScore));
  scoreBox(doc, x + (boxW + 6) * 2, y, boxW, boxH, 'Resume Score', result.resumeScore, scoreColor(result.resumeScore));
  y += boxH + 10;

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Summary', x, y);
  y = calloutBox(doc, result.summary || 'No summary available.', x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Matching Skills', x, y, PDF.primaryDark);
  y = bulletList(doc, result.matchingSkills, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Missing Skills', x, y, PDF.secondaryDark);
  y = bulletList(doc, result.missingSkills, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Strengths', x, y, PDF.primaryDark);
  y = bulletList(doc, result.strengths, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Weaknesses', x, y, PDF.secondaryDark);
  y = bulletList(doc, result.weaknesses, x, y, w);

  y = ensureSpace(doc, y, 30, pageNumRef);
  y = sectionTitle(doc, 'Suggestions to Improve', x, y);
  y = bulletList(doc, result.suggestions, x, y, w);

  doc.save('resume-analysis-report.pdf');
}

export default function ResultsPanel({ result }) {
  if (!result) return null;

  const checkIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
  const warnIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
  const bulbIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
    </svg>
  );

  return (
    <div className="mt-8 space-y-6">
      <div className="ui-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-wrap justify-center gap-8">
            <ScoreRing label="Matching %" score={result.matchScore} />
            <ScoreRing label="ATS Score" score={result.atsScore} />
            <ScoreRing label="Resume Score" score={result.resumeScore} />
          </div>
          <button
            onClick={() => downloadReport(result)}
            className="focus-ring shrink-0 inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:border-[#9E8B90] text-[#1F2937] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
            </svg>
            Download Report
          </button>
        </div>
        {result.summary ? (
          <p className="mt-6 text-sm text-[#374151] leading-relaxed border-t border-[#E5E7EB] pt-5">{result.summary}</p>
        ) : null}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="ui-card p-6">
          <h3 className="font-semibold text-[#1F2937] mb-3">Matching Skills</h3>
          <SkillChips items={result.matchingSkills} tone="good" />
        </div>
        <div className="ui-card p-6">
          <h3 className="font-semibold text-[#1F2937] mb-3">Missing Skills</h3>
          <SkillChips items={result.missingSkills} tone="bad" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="ui-card p-6">
          <h3 className="font-semibold text-[#1F2937] mb-3">Strengths</h3>
          <BulletList items={result.strengths} icon={checkIcon} />
        </div>
        <div className="ui-card p-6">
          <h3 className="font-semibold text-[#1F2937] mb-3">Weaknesses</h3>
          <BulletList items={result.weaknesses} icon={warnIcon} />
        </div>
      </div>

      <div className="ui-card p-6 bg-[#F8FAFC]">
        <h3 className="font-semibold text-[#1F2937] mb-3">Suggestions to Improve</h3>
        <BulletList items={result.suggestions} icon={bulbIcon} />
      </div>
    </div>
  );
}