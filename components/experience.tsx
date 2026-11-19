"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
}

const experiences: ExperienceItem[] = [
  {
    id: "experience-1",
    role: "Data Analyst Intern",
    company: "Edunet Foundation – VOIS",
    period: "Aug 2026 – Sep 2026",
    location: "Virtual",
    description: [
      "Worked with Python-based data analysis and machine learning workflows.",
      "Applied data processing and analysis techniques to work with datasets.",
      "Used Python libraries including NumPy, Pandas, Matplotlib, and Scikit-learn.",
      "Explored supervised learning models and evaluation metrics through practical work.",
    ],
  },
  {
    id: "experience-2",
    role: "Machine Learning Intern",
    company: "YHILLS",
    period: "Apr 2025 – Jun 2025",
    location: "Virtual",
    description: [
      "Developed machine learning projects using real-world datasets.",
      "Built a Student Performance Predictor using supervised learning techniques.",
      "Implemented Iris Flower Classification as a practical machine learning project.",
      "Worked with Python and libraries including NumPy, Pandas, Matplotlib, and Scikit-learn.",
    ],
  },
];

export function Experience() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const elements = document.querySelectorAll("[data-experience-item]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;

            setVisibleItems((prev) => {
              if (prev.has(id)) return prev;
              return new Set([...prev, id]);
            });

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -40px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      className="reveal py-16 sm:py-20 lg:py-28"
      aria-labelledby="experience-heading"
    >
      <div className="container px-4 sm:px-6">
        <h2
          id="experience-heading"
          className="section-title text-[var(--foreground)]"
        >
          Experience
        </h2>

        <p className="text-[var(--muted)] text-center max-w-2xl mx-auto mb-8 sm:mb-12 text-sm sm:text-base leading-relaxed">
          My journey through professional development.
        </p>

        <div className="timeline min-w-0">
          {experiences.map((exp, index) => (
            <div
              key={exp.id}
              id={exp.id}
              data-experience-item
              className={`timeline-item min-w-0 transition-all duration-700 ${
                visibleItems.has(exp.id) ? "visible" : ""
              }`}
              style={{
                transitionDelay: `${index * 100}ms`,
              }}
            >
              <div
                className="timeline-marker"
                style={{ backgroundColor: "var(--background)" }}
                aria-hidden="true"
              />

              <div className="timeline-content group min-w-0">
                <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                  <div
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-[var(--accent)]/10 text-[var(--accent)]"
                    aria-hidden="true"
                  >
                    <Briefcase className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] leading-snug break-words">
                        {exp.role}
                      </h3>

                      <span className="inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                        Internship
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs sm:text-sm text-[var(--muted)] mb-3 sm:mb-4">
                      <span className="font-medium text-[var(--foreground)]">
                        {exp.company}
                      </span>

                      <span aria-hidden="true">·</span>

                      <span>{exp.period}</span>

                      <span aria-hidden="true">·</span>

                      <span>{exp.location}</span>
                    </div>

                    <ul className="space-y-2 text-[var(--muted)] text-xs sm:text-sm leading-relaxed">
                      {exp.description.map((desc, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 group-hover:text-[var(--foreground)] transition-colors"
                        >
                          <span
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-[6px] sm:mt-2 bg-[var(--accent)]"
                            aria-hidden="true"
                          />

                          <span className="min-w-0 break-words">{desc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
