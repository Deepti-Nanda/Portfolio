"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { Experience } from "@/components/experience";
import { Contact } from "@/components/contact";

const subscribeToNothing = () => () => {};

function CopyrightYear() {
  // Prerender with a fixed year, then show the visitor's current year.
  const year = useSyncExternalStore(
    subscribeToNothing,
    () => new Date().getFullYear(),
    () => 2026,
  );

  return <>{year}</>;
}

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />

      <footer className="border-t border-[var(--card-border)] py-8 px-4">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--muted)]">
            © <CopyrightYear /> Deepti Nanda.
          </p>

          <div className="flex items-center gap-6 text-sm text-[var(--muted)]">
            <a
              href="https://github.com/Deepti-Nanda"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              GitHub
            </a>

            <a
              href="https://linkedin.com/in/deepti-nanda-271b352a3"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              LinkedIn
            </a>

            <a
              href="https://leetcode.com/u/Deepti_Nanda/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--accent)] transition-colors"
            >
              LeetCode
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
