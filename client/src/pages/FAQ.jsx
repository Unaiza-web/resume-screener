import { useState } from 'react';

const faqs = [
  {
    q: 'Do I need to sign up or log in to use this?',
    a: 'No. The AI Resume Screener works without any account, login, or signup. Just upload your resume, paste a job description, and get your analysis right away.',
  },
  {
    q: 'What file types can I upload?',
    a: 'You can upload your resume as a PDF or DOCX file, up to 10 MB.',
  },
  {
    q: 'How does the match score work?',
    a: 'An AI model compares the skills, experience, and keywords in your resume against the job description, then scores how closely they align. You also get an ATS score and a standalone Resume Score.',
  },
  {
    q: 'Is my resume stored anywhere?',
    a: 'This is a university project built for learning purposes, so no accounts are created and files are only used to generate your analysis, not tied to any personal profile.',
  },
  {
    q: 'Is this tool free to use?',
    a: 'Yes. This project was built as a final-year university project using free and open resources, so there is no cost to use it.',
  },
  {
    q: 'How accurate is the AI feedback?',
    a: 'The analysis is a helpful guide, not a guarantee. It is meant to highlight matching skills, missing skills, and improvement tips, use it alongside your own judgment before applying.',
  },
  {
    q: 'What should I do with the results?',
    a: 'Use the missing skills and suggestions to tailor your resume for the specific role, then re-run the analysis to see how your match score improves.',
  },
];

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="ui-card overflow-hidden">
      <button
        onClick={onToggle}
        className="focus-ring w-full flex items-center justify-between gap-4 text-left px-6 py-5"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#1F2937]">{item.q}</span>
        <span
          className={`shrink-0 w-7 h-7 rounded-full bg-[#E6EEF1] text-[#0F6483] flex items-center justify-center transition-transform duration-200 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-[#6B7280] leading-relaxed">{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <main className="max-w-3xl mx-auto px-6 py-14 bg-white">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F6483] bg-[#E6EEF1] rounded-full px-3 py-1">
        FAQ
      </span>

      <h1 className="mt-4 text-3xl font-bold text-[#1F2937]">Frequently Asked Questions</h1>
      <p className="mt-3 text-[#6B7280]">
        Everything you need to know about using the AI Resume Screener.
      </p>

      <div className="mt-8 space-y-3">
        {faqs.map((item, i) => (
          <FAQItem
            key={item.q}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}
      </div>
    </main>
  );
}