"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ResumeModal } from "./resume-modal";

interface ResumeContextType {
  openResume: () => void;
  closeResume: () => void;
  downloadResume: () => void;
  isResumeOpen: boolean;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const openResume = () => setIsResumeOpen(true);
  const closeResume = () => setIsResumeOpen(false);

  const downloadResume = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Deepti_Nanda_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ResumeContext.Provider
      value={{
        openResume,
        closeResume,
        downloadResume,
        isResumeOpen,
      }}
    >
      {children}
      <ResumeModal isOpen={isResumeOpen} onClose={closeResume} />
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
}