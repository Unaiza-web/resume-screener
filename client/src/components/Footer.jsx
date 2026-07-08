import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-[#E9D9DE] bg-[#FDF8FA] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display font-semibold text-[#1F2937]">AI Resume Screener</span>
          </div>
          <p className="mt-3 text-sm text-[#6B7280] max-w-sm leading-relaxed">
            Free AI-powered resume analysis and mock interview practice.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#1F2937]">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
            <li><Link to="/upload" className="hover:text-[#9E8B90] transition-colors">Resume Analysis</Link></li>
            <li><Link to="/interview" className="hover:text-[#9E8B90] transition-colors">AI Interview</Link></li>
            <li><Link to="/faq" className="hover:text-[#9E8B90] transition-colors">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#1F2937]">About</h4>
          <ul className="mt-3 space-y-2 text-sm text-[#6B7280]">
            <li><Link to="/about" className="hover:text-[#9E8B90] transition-colors">About the project</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[#E9D9DE]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-[#6B7280]">&copy; 2026 AI Resume Screener.</span>
         
        </div>
      </div>
    </footer>
  );
}