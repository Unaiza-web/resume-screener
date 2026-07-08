import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Resume", path: "/upload" },
    { name: "AI Interview", path: "/interview" },
    { name: "FAQ", path: "/faq" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#F3E7EC]/95 backdrop-blur-md border-b border-[#DCC4CC] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3">
          <Logo size={40} />

          <div>
            <h1 className="text-xl font-bold text-[#0F6483]">
              AI Resume Screener
            </h1>

            <p className="text-xs text-[#A7878D]">
              Smart Career Assistant
            </p>
          </div>
        </NavLink>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-2">
          {links.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-[#0F6483] text-white shadow-md"
                    : "text-gray-700 hover:bg-[#F4E7EB] hover:text-[#0F6483]"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Upload Button */}
        <div className="hidden md:block">
          <NavLink
            to="/upload"
            className="bg-[#A7878D] hover:bg-[#96747A] text-white px-5 py-2.5 rounded-xl font-semibold transition"
          >
            Upload Resume
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#0F6483]"
          onClick={() => setOpen(!open)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <path d="M4 7h16" />
                <path d="M4 12h16" />
                <path d="M4 17h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#F3E7EC] border-t border-[#DCC4CC]">

          <div className="flex flex-col p-4 gap-2">

            {links.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-xl font-medium ${
                    isActive
                      ? "bg-[#0F6483] text-white"
                      : "text-gray-700 hover:bg-[#F4E7EB]"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            <NavLink
              to="/upload"
              onClick={() => setOpen(false)}
              className="mt-2 bg-[#A7878D] text-white rounded-xl text-center py-3 font-semibold hover:bg-[#96747A]"
            >
              Upload Resume
            </NavLink>

          </div>

        </div>
      )}
    </header>
  );
}