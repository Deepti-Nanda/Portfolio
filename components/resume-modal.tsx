"use client";

import { useEffect, useState } from "react";
import { X, Download, FileText, ExternalLink } from "lucide-react";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeUrl?: string;
}

export function ResumeModal({
  isOpen,
  onClose,
  resumeUrl = "/resume.pdf",
}: ResumeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = "Deepti_Nanda_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div
        className="resume-modal-content flex flex-col h-[85vh] w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:px-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-[var(--accent)]" />
            <h3 id="resume-title" className="text-lg font-semibold text-[var(--foreground)]">
              Deepti Nanda — Resume
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-xs md:text-sm"
              title="Download Resume PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Close resume modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content / Viewer */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[var(--background)] flex flex-col items-center justify-center">
          {/* Visual Interactive Resume Preview */}
          <div className="w-full max-w-2xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6 md:p-10 shadow-sm space-y-6 text-left">
            {/* Header info */}
            <div className="border-b border-[var(--card-border)] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Deepti Nanda</h1>
                <p className="text-[var(--accent)] font-medium mt-1">Aspiring Full-Stack Developer</p>
                <p className="text-sm text-[var(--muted)] mt-1">BCA Undergraduate (2024–2027) · Sarala Birla University</p>
              </div>
              <div className="text-sm text-[var(--muted)] space-y-1 sm:text-right">
                <p>dnhk2005@gmail.com</p>
                <p>Ranchi, India</p>
                <p className="text-xs text-[var(--accent)]">Open to Internships / Full-Time</p>
              </div>
            </div>

            {/* Summary */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Summary</h2>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">
                Dedicated Full-Stack Developer with hands-on experience building scalable web applications and exploring AI/ML solutions. Proven ability to solve complex problems through strong DSA fundamentals, modern JavaScript frameworks, and full-stack technologies.
              </p>
            </div>

            {/* Technical Skills */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Technical Skills</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Frontend:</span>{" "}
                  <span className="text-[var(--muted)]">React, JavaScript, HTML & CSS, Tailwind CSS</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Backend:</span>{" "}
                  <span className="text-[var(--muted)]">Node.js, Python, Django, Full-Stack Dev</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Databases:</span>{" "}
                  <span className="text-[var(--muted)]">MongoDB, PostgreSQL, SQL</span>
                </div>
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Core & AI:</span>{" "}
                  <span className="text-[var(--muted)]">Data Structures, Machine Learning, Data Analytics, Data Viz</span>
                </div>
              </div>
            </div>

            {/* Featured Projects */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Featured Projects</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex justify-between font-semibold text-[var(--foreground)]">
                    <span>OpenSource Radar</span>
                    <span className="text-xs text-[var(--muted)] font-normal">React, Node.js, GitHub API</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Searches untaken "good first issues" across GitHub in any selected language to accelerate open-source contributions.
                  </p>
                </div>
                <div>
                  <div className="flex justify-between font-semibold text-[var(--foreground)]">
                    <span>Raksha</span>
                    <span className="text-xs text-[var(--muted)] font-normal">Python, TensorFlow, Offline AI</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Offline AI health guardian for heat waves, floods, and severe air pollution conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">Education</h2>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-semibold text-[var(--foreground)]">Sarala Birla University</span> — BCA (2024–2027)
                  <p className="text-xs text-[var(--muted)]">Focus: Full-Stack Development & Applied AI</p>
                </div>
                <span className="text-xs text-[var(--muted)]">Ranchi, India</span>
              </div>
            </div>

            {/* Note badge */}
            <div className="p-3 bg-[var(--card-border)]/50 rounded-lg text-center text-xs text-[var(--muted)]">
              📄 Official resume document attached. Click below to download or attach updated PDF.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex justify-between items-center text-xs text-[var(--muted)]">
          <span>Deepti Nanda · Portfolio</span>
          <button
            onClick={handleDownload}
            className="text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF File
          </button>
        </div>
      </div>
    </div>
  );
}