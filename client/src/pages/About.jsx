const items = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
      </svg>
    ),
    title: 'Easy resume analysis',
    desc: 'Upload a PDF or DOCX resume, paste a job description, and get an instant analysis with a match score, ATS score, and resume score.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
      </svg>
    ),
    title: 'AI-powered feedback',
    desc: 'A large language model reads both documents and highlights matching skills, missing skills, strengths, and weaknesses, with suggestions to improve your resume.',
  },
  
];

export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-14 bg-white">
      

      <h1 className="mt-4 text-3xl font-bold text-[#1F2937]">About the AI Resume Screener</h1>
      <p className="mt-3 text-[#374151] leading-relaxed">
        The AI Resume Screener is a simple web app that helps job seekers understand how well their
        resume matches a specific job description. It uses AI to compare the two documents and gives
        clear feedback in seconds.
      </p>

      <div className="mt-8 space-y-4">
        {items.map((it) => (
          <div key={it.title} className="ui-card p-6 flex gap-4">
            <span className="shrink-0 w-9 h-9 rounded-lg bg-[#E6EEF1] text-[#0F6483] flex items-center justify-center">
              {it.icon}
            </span>
            <div>
              <h3 className="font-semibold text-[#1F2937]">{it.title}</h3>
              <p className="mt-1 text-sm text-[#6B7280] leading-relaxed">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 ui-card p-6 bg-[#F8FAFC]">
        <h3 className="font-semibold text-[#1F2937] text-sm">How it helps</h3>
        <p className="mt-1.5 text-sm text-[#374151] leading-relaxed">
          Before applying to a job, run your resume through the screener to see what to improve. This helps you
          tailor your resume to each role and increases your chances of getting shortlisted by ATS systems and
          recruiters.
        </p>
      </div>
    </main>
  );
}