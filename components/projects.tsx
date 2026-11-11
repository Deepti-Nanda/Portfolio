"use client";

import { ExternalLink } from "lucide-react";
import { GitHubIcon } from "./brand-icons";

interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  thumbnail?: string;
}

const projects: Project[] = [
  {
    title: "OpenSource Radar",
    description:
      'Searches every untaken "good first issue" on GitHub, in your language, and helps you land your first PR.',
    techStack: ["React", "TypeScript", "Node.js", "GitHub API", "Tailwind CSS"],
    githubUrl: "https://github.com/Deepti-Nanda/opensource-radar",
    liveUrl: "#",
    thumbnail: "/projects/opensource-radar.jpg",
  },
  {
    title: "Raksha",
    description:
      "Offline AI health guardian for heat waves, floods and air pollution.",
    techStack: ["Python", "TensorFlow", "React Native", "SQLite", "ML Kit"],
    githubUrl: "https://github.com/Deepti-Nanda/raksha",
    liveUrl: "#",
    thumbnail: "/projects/raksha.jpg",
  },
  {
    title: "A Pinch of Memories",
    description: "Description and links will be added later.",
    techStack: ["React", "Node.js", "MongoDB", "Express", "Tailwind CSS"],
    githubUrl: "#",
    liveUrl: "#",
    thumbnail: "/projects/pinch-of-memories.jpg",
  },
];

export function Projects() {
  return (
    <section
      id="projects"
      className="reveal scroll-mt-20"
      aria-labelledby="projects-heading"
    >
      <div className="container">
        <h2
          id="projects-heading"
          className="section-title text-[var(--foreground)]"
        >
          Projects
        </h2>

        <p className="text-[var(--muted)] text-center max-w-2xl mx-auto mb-8 sm:mb-12 px-2 text-sm sm:text-base leading-relaxed">
          A selection of projects I've built, showcasing my full-stack
          development skills and problem-solving approach.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 items-stretch">
          {projects.map((project, index) => (
            <article
              key={project.title}
              className="group relative flex flex-col min-w-0 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/10 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[var(--accent)]/20 to-[var(--card-border)]">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={`${project.title} preview`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-5 sm:p-8">
                      <ExternalLink
                        className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-[var(--muted)]">
                        Thumbnail coming soon
                      </p>
                    </div>
                  </div>
                )}

                {/* Tech Stack Preview on Hover */}
                <div className="pointer-events-none absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                  <div className="flex flex-wrap gap-2 w-full">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="skill-chip text-xs px-2 py-1 bg-white/10 border-white/20 text-white backdrop-blur-sm"
                      >
                        {tech}
                      </span>
                    ))}

                    {project.techStack.length > 4 && (
                      <span className="skill-chip text-xs px-2 py-1 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                        +{project.techStack.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-2 sm:mb-3 group-hover:text-[var(--accent)] transition-colors">
                  {project.title}
                </h3>

                <p className="text-[var(--muted)] text-sm leading-relaxed mb-4 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Stack Chips */}
                <div
                  className="flex flex-wrap gap-2 mb-5 sm:mb-6"
                  aria-label="Technologies used"
                >
                  {project.techStack.map((tech) => (
                    <span key={tech} className="skill-chip text-xs">
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 mt-auto">
                  {project.liveUrl && project.liveUrl !== "#" ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex-1 min-w-0 min-h-11 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      aria-label={`View ${project.title} live`}
                    >
                      <ExternalLink
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      Live
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary flex-1 min-w-0 min-h-11 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm opacity-50 cursor-not-allowed"
                      disabled
                      aria-label={`Live demo for ${project.title} coming soon`}
                    >
                      <ExternalLink
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      Live
                    </button>
                  )}

                  {project.githubUrl !== "#" ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary flex-1 min-w-0 min-h-11 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <GitHubIcon
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      GitHub
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary flex-1 min-w-0 min-h-11 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm opacity-50 cursor-not-allowed"
                      disabled
                      aria-label={`GitHub repository for ${project.title} coming soon`}
                    >
                      <GitHubIcon
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      GitHub
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
