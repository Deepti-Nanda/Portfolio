"use client";

import { useState, useRef, useEffect } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useTheme } from "@/components/theme-provider";
import { shatterThemeSwitch } from "@/components/theme-shatter";
import { useResume } from "@/components/resume-context";
import {
  Menu,
  X,
  Sun,
  Moon,
  Download,
  FileText,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experience" },
  { href: "#contact", label: "Contact Me" },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { openResume, downloadResume } = useResume();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resumeDropdownOpen, setResumeDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const resumeBtnRef = useRef<HTMLButtonElement>(null);
  const mobileMenuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setResumeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      if (resumeDropdownOpen) {
        setResumeDropdownOpen(false);
        resumeBtnRef.current?.focus();
      }

      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        mobileMenuBtnRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [resumeDropdownOpen, mobileMenuOpen]);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setResumeDropdownOpen(false);
  };

  const handleThemeToggle = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const next = resolvedTheme === "dark" ? "light" : "dark";

    // Shatter from where the button was clicked; keyboard presses have no
    // pointer position, so use the button's centre.
    const rect = event.currentTarget.getBoundingClientRect();
    const origin: [number, number] =
      event.detail > 0
        ? [event.clientX, event.clientY]
        : [rect.left + rect.width / 2, rect.top + rect.height / 2];

    void shatterThemeSwitch(origin, () => setTheme(next));
  };

  const getThemeIcon = () => {
    return resolvedTheme === "dark" ? (
      <Sun className="w-5 h-5" />
    ) : (
      <Moon className="w-5 h-5" />
    );
  };

  const getThemeLabel = () => {
    return resolvedTheme === "dark" ? "Dark" : "Light";
  };

  const handleResumeView = () => {
    setResumeDropdownOpen(false);
    setMobileMenuOpen(false);
    openResume();
  };

  const handleResumeDownload = () => {
    setResumeDropdownOpen(false);
    setMobileMenuOpen(false);
    downloadResume();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 glass border-b border-[var(--card-border)]">
      <nav
        className="container flex items-center justify-between h-16 md:h-14 px-4"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] transition-colors hover:text-[var(--accent)] focus-visible:outline-offset-4"
          aria-label="Deepti Nanda - Home"
          onClick={handleLinkClick}
        >
          <Logo className="h-7 w-7 shrink-0" />
          <span>Deepti Nanda</span>
        </Link>

        <div className="hidden md:flex items-center gap-5 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-[var(--accent)] after:transition-all hover:after:w-full"
            >
              {link.label}
            </Link>
          ))}

          <div className="relative" ref={dropdownRef}>
            <button
              ref={resumeBtnRef}
              onClick={() => setResumeDropdownOpen((prev) => !prev)}
              className="btn-secondary flex items-center gap-2 py-2 px-3 text-xs md:text-sm"
              aria-expanded={resumeDropdownOpen}
              aria-haspopup="true"
              aria-controls="resume-dropdown"
              aria-label="Resume options"
            >
              <FileText className="w-4 h-4" />
              Resume
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  resumeDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {resumeDropdownOpen && (
              <div
                id="resume-dropdown"
                className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[var(--card-border)] py-2 shadow-lg animate-fade-in-up bg-[var(--card-bg)]"
              >
                <button
                  onClick={handleResumeView}
                  className="w-full min-h-11 flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[var(--foreground)] hover:bg-[var(--background)] hover:text-[var(--accent)] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[var(--accent)]" />
                  View Resume
                </button>

                <button
                  onClick={handleResumeDownload}
                  className="w-full min-h-11 flex items-center gap-3 px-4 py-2.5 text-sm text-left text-[var(--foreground)] hover:bg-[var(--background)] hover:text-[var(--accent)] transition-colors"
                >
                  <Download className="w-4 h-4 text-[var(--accent)]" />
                  Download Resume
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleThemeToggle}
            className="btn-ghost p-2 rounded-xl min-w-11 min-h-11 flex items-center justify-center"
            aria-label={`Switch theme (current: ${getThemeLabel()})`}
            title={`Theme: ${getThemeLabel()}`}
          >
            {getThemeIcon()}
          </button>
        </div>

        <button
          ref={mobileMenuBtnRef}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden btn-ghost p-2 rounded-xl min-w-11 min-h-11 flex items-center justify-center"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden glass border-t border-[var(--card-border)] animate-fade-in-up bg-[var(--card-bg)] max-h-[calc(100dvh-4rem)] overflow-y-auto"
        >
          <div className="container px-4 py-5 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="flex items-center min-h-11 text-base sm:text-lg font-medium text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-[var(--card-border)] space-y-3">
              <button
                onClick={handleResumeView}
                className="w-full min-h-11 flex items-center gap-3 px-4 py-3 text-left text-[var(--foreground)] hover:text-[var(--accent)] transition-colors rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
              >
                <FileText className="w-5 h-5 text-[var(--accent)]" />
                View Resume
              </button>

              <button
                onClick={handleResumeDownload}
                className="w-full min-h-11 flex items-center gap-3 px-4 py-3 text-left text-[var(--foreground)] hover:text-[var(--accent)] transition-colors rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
              >
                <Download className="w-5 h-5 text-[var(--accent)]" />
                Download Resume
              </button>
            </div>

            <button
              onClick={handleThemeToggle}
              className="w-full min-h-11 flex items-center justify-between px-4 py-3 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
              aria-label={`Change theme (current: ${getThemeLabel()})`}
            >
              <span className="flex items-center gap-3">
                {getThemeIcon()}
                Theme: {getThemeLabel()}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
