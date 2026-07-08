import { Link } from 'react-router-dom';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h6" />
      </svg>
    ),
    title: 'AI Resume Analysis',
    desc: 'Upload your resume and a job description to get an instant, detailed match analysis.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
      </svg>
    ),
    title: 'ATS Score Check',
    desc: 'See exactly how applicant tracking systems will read and parse your resume.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
    title: 'Actionable Suggestions',
    desc: 'Get specific, practical tips to close skill gaps and strengthen your resume.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v4" /><path d="M8 23h8" />
      </svg>
    ),
    title: 'AI Mock Interview',
    desc: 'Practice with role-specific questions in text or voice mode, then get a scored report.',
  },
];

const stats = [
  { value: '100%', label: 'Free to use' },
  { value: '<60s', label: 'To get results' },
  { value: '5', label: 'Interview questions' },
];

const steps = [
  { n: '01', title: 'Upload Resume', desc: 'Add your PDF or DOCX resume, no account needed.', color: 'teal' },
  { n: '02', title: 'Paste Job Description', desc: 'Add the role you want to be evaluated against.', color: 'mauve' },
  { n: '03', title: 'Review Your Analysis', desc: 'See your ATS score, matching skills, and gaps.', color: 'teal' },
  { n: '04', title: 'Practice the Interview', desc: 'Take an AI mock interview and get a scored report.', color: 'mauve' },
];

const benefits = [
  'Completely free to use',
  'Instant, detailed feedback',
  'ATS-optimized scoring',
  'Realistic mock interview practice',
  'Works for any role or industry',
];

function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 360" className="w-full h-auto max-w-md mx-auto" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="30" width="220" height="290" rx="16" fill="#FFFFFF" />
      <rect x="66" y="64" width="120" height="10" rx="5" fill="#0F6483" />
      <rect x="66" y="86" width="168" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="102" width="168" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="118" width="120" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="146" width="80" height="8" rx="4" fill="#A7878D" />
      <rect x="66" y="166" width="168" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="182" width="150" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="210" width="80" height="8" rx="4" fill="#A7878D" />
      <rect x="66" y="230" width="168" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="246" width="140" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="66" y="262" width="168" height="7" rx="3.5" fill="#E5E7EB" />

      <circle cx="330" cy="90" r="54" fill="#FFFFFF" />
      <circle cx="330" cy="90" r="34" fill="none" stroke="#A7878D" strokeWidth="7" strokeDasharray="160" strokeDashoffset="30" strokeLinecap="round" transform="rotate(-90 330 90)" />
      <text x="330" y="97" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0F6483" fontFamily="Lexend, sans-serif">82%</text>

      <rect x="270" y="190" width="130" height="130" rx="18" fill="#FFFFFF" />
      <circle cx="335" cy="228" r="18" fill="#F4E7EB" />
      <path d="M328 228l5 5 10-10" stroke="#A7878D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="290" y="256" width="90" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="290" y="272" width="70" height="7" rx="3.5" fill="#E5E7EB" />
      <rect x="290" y="292" width="60" height="18" rx="9" fill="#0F6483" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="bg-white">
      {/* Hero — deeper solid teal background with subtle texture */}
      <section className="bg-[#0A4D63] relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div className="relative max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 rounded-full px-3 py-1.5">
              AI-Powered &middot; Free &middot;
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl font-bold text-white leading-tight">
              Land your next role with a resume that <span className="text-[#F4E7EB]">actually gets read.</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 leading-relaxed max-w-lg">
              Upload your resume and a job description. Get an instant ATS score, skill-gap
              analysis, and a realistic AI mock interview — completely free.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/upload"
                className="focus-ring bg-white text-[#0F6483] text-sm font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-white/90 transition-colors"
              >
                Analyze My Resume
              </Link>
              <Link
                to="/interview"
                className="focus-ring bg-[#A7878D] hover:bg-[#96747A] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Try AI Interview
              </Link>
            </div>
          </div>
          <HeroIllustration />
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-[#EDD3DA]">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#0F6483]">{s.value}</div>
              <div className="mt-1 text-xs sm:text-sm text-[#6B7280]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-semibold text-[#A7878D] uppercase tracking-wide">Features</span>
          <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">Everything you need to prepare</h2>
          <p className="mt-3 text-[#6B7280]">From resume analysis to interview practice, in one clean workflow.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`ui-card p-6 hover:shadow-md hover:-translate-y-1 transition-all ${
                i % 2 === 0 ? 'hover:border-[#0F6483]/30' : 'hover:border-[#A7878D]/30'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  i % 2 === 0 ? 'bg-[#0F6483] text-white' : 'bg-[#A7878D] text-white'
                }`}
              >
                {f.icon}
              </div>
              <h3 className="mt-4 font-semibold text-[#1F2937]">{f.title}</h3>
              <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-semibold text-[#0F6483] uppercase tracking-wide">Process</span>
            <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">How it works</h2>
            <p className="mt-3 text-[#6B7280]">Four simple steps, no account required.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="ui-card p-6 relative overflow-hidden">
                <span
                  className={`text-3xl font-bold ${s.color === 'teal' ? 'text-[#0F6483]' : 'text-[#A7878D]'}`}
                >
                  {s.n}
                </span>
                <h3 className="mt-3 font-semibold text-[#1F2937]">{s.title}</h3>
                <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">{s.desc}</p>
                <span
                  className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 ${
                    s.color === 'teal' ? 'bg-[#0F6483]' : 'bg-[#A7878D]'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold text-[#A7878D] uppercase tracking-wide">Why us</span>
          <h2 className="mt-2 text-3xl font-bold text-[#1F2937]">Why job seekers use this</h2>
          <p className="mt-3 text-[#6B7280] leading-relaxed">
            Built to make resume prep and interview practice accessible
            to everyone, with no cost and no account.
          </p>
          <ul className="mt-6 space-y-3">
            {benefits.map((b, i) => (
              <li key={b} className="flex items-center gap-3 text-[#1F2937]">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white ${
                    i % 2 === 0 ? 'bg-[#0F6483]' : 'bg-[#A7878D]'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="ui-card p-8 bg-[#0A4D63]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 text-white flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><path d="M12 19v4" /><path d="M8 23h8" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">Practice out loud</h3>
              <p className="text-sm text-white/75">Voice interview mode simulates the real thing.</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-white w-4/5" /></div>
            <div className="h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-[#F4E7EB] w-3/5" /></div>
            <div className="h-2 rounded-full bg-white/15"><div className="h-2 rounded-full bg-white w-2/3" /></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-[#8B6970] px-8 py-14 text-center relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots2" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots2)" />
          </svg>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white">Ready to see where you stand?</h2>
            <p className="mt-3 text-white/85 max-w-lg mx-auto">
              Get your resume analyzed in under a minute — completely free
            </p>
            <Link
              to="/upload"
              className="focus-ring mt-7 inline-flex items-center bg-white text-[#0F6483] text-sm font-semibold px-7 py-3 rounded-xl shadow-sm hover:bg-white/90 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}