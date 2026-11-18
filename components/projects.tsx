"use client";

import { ArrowUpRight, ExternalLink } from "lucide-react";
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
      "OpenSource Radar helps developers find open issues they can contribute to, across all public projects on GitHub.",
    techStack: ["React + Vite", "JavaScript", "Node.js", "GitHub API", "CSS"],
    githubUrl: "https://github.com/opensource-radar/opensource-radar",
    liveUrl: "https://opensource-radar.com/",
    thumbnail: "",
  },
  {
    title: "Raksha",
    description:
      "Offline AI health guardian for heat waves, floods and smog. On-device risk scoring and emergency SOS.",
    techStack: [
      "React Native",
      "TypeScript",
      "Expo",
      "Health Connect",
      "On-device AI",
    ],
    githubUrl: "https://github.com/Deepti-Nanda/raksha",
    liveUrl: "https://claude.ai/artifact/HPoan1Xh1iyQxEW3r33v3S",
    thumbnail: "",
  },
  {
    title: "A Pinch of Memories",
    description:
      "A Pinch of Memories is a nostalgic recipe website created to celebrate the connection between food, memories, traditions, and home.",
    techStack: ["HTML5", "CSS", "JavaScript", "LocalStorage API"],
    githubUrl: "https://github.com/Deepti-Nanda/APinchOfMemories",
    liveUrl: "https://deepti-nanda.github.io/APinchOfMemories",
    thumbnail: "",
  },
];

/** "OpenSource Radar" -> "opensource-radar", for stable card anchors. */
function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

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

        <p className="mx-auto mb-8 max-w-2xl px-2 text-center text-sm leading-relaxed text-[var(--muted)] sm:mb-12 sm:text-base">
          A collection of projects where I explore ideas, build practical
          solutions, and apply my skills in software development.
        </p>

        <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {projects.map((project, index) => (
            <article
              key={project.title}
              // Linked from the Skills orbit's "Used in" list; the card is
              // highlighted when it's the link target.
              id={`project-${toSlug(project.title)}`}
              className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all duration-300 hover:border-[var(--accent)] hover:shadow-xl hover:shadow-[var(--accent)]/10 animate-fade-in-up scroll-mt-24 target:border-[var(--accent)] target:ring-2 target:ring-[var(--accent)]/40"
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
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="!p-6 text-center sm:!p-8">
                      <ExternalLink
                        className="mx-auto mb-3 h-10 w-10 text-[var(--muted)] sm:mb-4 sm:h-12 sm:w-12"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-[var(--muted)]">
                        Thumbnail coming soon
                      </p>
                    </div>
                  </div>
                )}

                {/* Tech Stack Preview on Hover */}
                <div className="pointer-events-none absolute inset-0 flex items-end bg-black/50 !p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:!p-5">
                  <div className="flex w-full flex-wrap gap-2">
                    {project.techStack.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="skill-chip border-white/20 bg-white/10 px-2 py-1 text-xs text-white backdrop-blur-sm"
                      >
                        {tech}
                      </span>
                    ))}

                    {project.techStack.length > 4 && (
                      <span className="skill-chip border-white/20 bg-white/10 px-2 py-1 text-xs text-white backdrop-blur-sm">
                        +{project.techStack.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col !px-5 !py-5 sm:!px-6 sm:!py-6">
                <h3 className="mb-4 min-h-8 text-lg font-semibold text-[var(--foreground)] transition-colors group-hover:text-[var(--accent)] sm:text-xl">
                  {project.title}
                </h3>

                <p className="mb-8 min-h-[5.25rem] text-sm leading-7 text-[var(--muted)] line-clamp-3">
                  {project.description}
                </p>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2 pt-4 sm:gap-3">
                  {project.liveUrl && project.liveUrl !== "#" ? (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 text-xs sm:gap-2 sm:text-sm"
                      aria-label={`View ${project.title} live`}
                    >
                      <ExternalLink
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      Live
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary flex min-h-11 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1.5 text-xs opacity-50 sm:gap-2 sm:text-sm"
                      disabled
                      aria-label={`Live demo for ${project.title} coming soon`}
                    >
                      <ExternalLink
                        className="h-4 w-4 shrink-0"
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
                      className="btn-secondary flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 text-xs sm:gap-2 sm:text-sm"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <GitHubIcon
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                      GitHub
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary flex min-h-11 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1.5 text-xs opacity-50 sm:gap-2 sm:text-sm"
                      disabled
                      aria-label={`GitHub repository for ${project.title} coming soon`}
                    >
                      <GitHubIcon
                        className="h-4 w-4 shrink-0"
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
      <div className="mt-12 flex justify-center">
        <a
          href="https://github.com/Deepti-Nanda?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
        >
          Explore more
          <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
