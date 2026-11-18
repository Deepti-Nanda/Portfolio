"use client";

import { useEffect } from "react";
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
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 modal-overlay animate-fade-in-up"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div
        className="resume-modal-content flex flex-col h-[90vh] w-full max-w-5xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-4 md:px-6 border-b border-[var(--card-border)] bg-[var(--card-bg)]">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-[var(--accent)] shrink-0" />
            <h3
              id="resume-title"
              className="text-base md:text-lg font-semibold text-[var(--foreground)] truncate"
            >
              Deepti Nanda — Resume
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center gap-2 py-2 px-3 md:px-4 text-xs md:text-sm"
              title="Download Resume PDF"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost p-2 rounded-lg"
              aria-label="Open resume in new tab"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>

            <button
              onClick={onClose}
              className="btn-ghost p-2 rounded-lg"
              aria-label="Close resume modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 bg-[var(--background)]">
          <iframe
            src={resumeUrl}
            title="Deepti Nanda Resume"
            className="w-full h-full border-0"
          />
        </div>

        <div className="p-3 md:px-6 border-t border-[var(--card-border)] bg-[var(--card-bg)] flex justify-between items-center text-xs text-[var(--muted)]">
          <span>Deepti Nanda · Portfolio</span>
          <button
            onClick={handleDownload}
            className="text-[var(--accent)] hover:underline flex items-center gap-1 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Download Resume
          </button>
        </div>
      </div>
    </div>
  );
}