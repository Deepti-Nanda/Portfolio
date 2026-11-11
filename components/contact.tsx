
"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Mail,
  Send,
  Check,
  Loader2,
  Copy,
  CheckCheck,
  Code,
} from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "./brand-icons";

const EMAIL = "dnhk2005@gmail.com";

const INITIAL_FORM = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setStatus("submitting");
    setStatusMessage("");

    try {
      const website = new FormData(e.currentTarget).get("website");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          website: typeof website === "string" ? website : "",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to send your message."
        );
      }

      setStatus("success");
      setStatusMessage(
        "Your message has been submitted successfully. Thank you for reaching out!"
      );
      setFormData(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);

      setCopied(true);
      setCopyError("");

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      setCopyError(
        "Unable to copy automatically. Please select the email address."
      );
    }
  };

  const socialLinks = [
    {
      name: "Email",
      href: `mailto:${EMAIL}`,
      icon: Mail,
      label: EMAIL,
      copyable: true,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/deepti-nanda-271b352a3",
      icon: LinkedInIcon,
      label: "linkedin.com/in/deepti-nanda-271b352a3",
    },
    {
      name: "GitHub",
      href: "https://github.com/Deepti-Nanda",
      icon: GitHubIcon,
      label: "github.com/Deepti-Nanda",
    },
    {
      name: "LeetCode",
      href: "https://leetcode.com/u/Deepti_Nanda/",
      icon: Code,
      label: "leetcode.com/u/Deepti_Nanda/",
    },
  ];

  return (
    <section
      id="contact"
      className="reveal"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            id="contact-heading"
            className="section-title text-[var(--foreground)]"
          >
            Let's Talk
          </h2>

          <p className="text-[var(--muted)] mt-4 text-lg">
            Have a project in mind or just want to say hi? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6">
                Get in Touch
              </h3>

              <div className="space-y-6">
                {socialLinks.map((social) => (
                  <div
                    key={social.name}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-[var(--card-border)] group"
                  >
                    <a
                      href={social.href}
                      target={
                        social.href.startsWith("http")
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        social.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="flex flex-1 min-w-0 items-center gap-4"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-[var(--accent)] bg-[var(--accent)]/10">
                        <social.icon
                          className="w-6 h-6"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm text-[var(--muted)]">
                          {social.name}
                        </p>

                        <p className="text-[var(--foreground)] font-medium group-hover:text-[var(--accent)] transition-colors break-all">
                          {social.label}
                        </p>
                      </div>
                    </a>

                    {social.copyable && (
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="btn-ghost shrink-0 p-2 transition-colors"
                        aria-label="Copy email address"
                        title="Copy email address"
                      >
                        {copied ? (
                          <CheckCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-[var(--muted)]" />
                        )}
                      </button>
                    )}
                  </div>
                ))}

                <p
                  className="text-xs text-[var(--muted)]"
                  aria-live="polite"
                >
                  {copied
                    ? "Email address copied!"
                    : copyError}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-4">
                Availability
              </h3>

              <div className="space-y-3 text-[var(--muted)]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span>Open to internships (part-time & full-time)</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span>Available for freelance projects</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span>Open to collaboration & open source</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Typically responds within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-6">
              Send a Message
            </h3>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Honeypot field for basic bot filtering */}
              <div
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="website">
                  Leave this field empty
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[var(--foreground)] mb-2"
                  >
                    Name
                  </label>

                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="name"
                    className="form-input"
                    placeholder="Your name"
                    disabled={status === "submitting"}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--foreground)] mb-2"
                  >
                    Email
                  </label>

                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={254}
                    autoComplete="email"
                    className="form-input"
                    placeholder="your@email.com"
                    disabled={status === "submitting"}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Subject
                </label>

                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={120}
                  className="form-input"
                  placeholder="What's this about?"
                  disabled={status === "submitting"}
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  className="form-input resize-y min-h-[120px]"
                  placeholder="Tell me about your project, opportunity, or just say hello..."
                  disabled={status === "submitting"}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-3 py-4"
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : status === "success" ? (
                  <>
                    <Check className="w-5 h-5" />
                    Message Sent!
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              {statusMessage && (
                <p
                  role={status === "error" ? "alert" : "status"}
                  aria-live="polite"
                  className={`text-sm text-center ${
                    status === "error"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {statusMessage}
                </p>
              )}

              <p className="text-xs text-[var(--muted)] text-center">
                By submitting, you agree to share your email for correspondence purposes only.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
