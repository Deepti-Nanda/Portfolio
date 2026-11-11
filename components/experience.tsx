"use client";

import { useEffect, useState } from "react";
import { Code, Briefcase, GraduationCap, Award } from "lucide-react";

interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string[];
  type: "work" | "education" | "project" | "achievement";
  icon: React.ReactNode;
}

const experiences: ExperienceItem[] = [
  {
    id: "1",
    role: "Full-Stack Developer Intern",
    company: "Tech Company",
    period: "Jun 2025 - Present",
    location: "Remote",
    description: [
      "Building scalable web applications using React, Node.js, and PostgreSQL",
      "Implementing RESTful APIs and integrating third-party services",
      "Collaborating with cross-functional teams in an agile environment",
      "Optimizing database queries and improving application performance by 40%",
    ],
    type: "work",
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    id: "2",
    role: "Open Source Contributor",
    company: "Various Projects",
    period: "Jan 2025 - Present",
    location: "Remote",
    description: [
      "Contributed to OpenSource Radar - a tool for finding good first issues",
      "Built Raksha - offline AI health guardian for disaster scenarios",
      "Regular contributor to React and Node.js ecosystem packages",
      "Mentoring newcomers in open source through GitHub discussions",
    ],
    type: "project",
    icon: <Code className="w-5 h-5" />,
  },
  {
    id: "3",
    role: "BCA - Bachelor of Computer Applications",
    company: "Sarala Birla University",
    period: "2024 - 2027 (Expected)",
    location: "Ranchi, Jharkhand, India",
    description: [
      "Coursework: Data Structures, Algorithms, Database Systems, Web Development",
      "Specialization: Full-Stack Development and Machine Learning",
      "CGPA: 8.5/10 | Dean's List: 2024, 2025",
      "Active member of Coding Club and AI Research Group",
    ],
    type: "education",
    icon: <GraduationCap className="w-5 h-5" />,
  },
  {
    id: "4",
    role: "LeetCode Top 5% Contest Ranking",
    company: "LeetCode",
    period: "2024",
    location: "Global",
    description: [
      "Solved 300+ algorithmic problems across arrays, trees, graphs, DP",
      "Consistent participant in weekly and biweekly contests",
      "Strong foundation in Data Structures & Algorithms",
      "Preferred languages: Python, JavaScript, C++",
    ],
    type: "achievement",
    icon: <Award className="w-5 h-5" />,
  },
];

const typeStyles = {
  work: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    iconBg: "bg-blue-500/20",
  },
  project: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    iconBg: "bg-green-500/20",
  },
  education: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/20",
  },
  achievement: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/20",
  },
};

export function Experience() {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const elements = document.querySelectorAll("[data-experience-item]");

    if (!("IntersectionObserver" in window)) {
      setVisibleItems(new Set(experiences.map((exp) => exp.id)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              if (prev.has(entry.target.id)) return prev;
              return new Set([...prev, entry.target.id]);
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

    elements.forEach((el) => observer.observe(el));

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
          My journey through education, open source, and professional
          development.
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
                    className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${typeStyles[exp.type].iconBg} ${typeStyles[exp.type].color}`}
                    aria-hidden="true"
                  >
                    {exp.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] leading-snug break-words">
                        {exp.role}
                      </h3>

                      <span
                        className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${typeStyles[exp.type].bg} ${typeStyles[exp.type].color} ${typeStyles[exp.type].border}`}
                      >
                        {exp.type.charAt(0).toUpperCase() + exp.type.slice(1)}
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
