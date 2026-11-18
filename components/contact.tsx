"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { SiX } from "@icons-pack/react-simple-icons";
import {
  Mail,
  Send,
  Check,
  Loader2,
  Copy,
  CheckCheck,
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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
        throw new Error(result.message || "Unable to send your message.");
      }

      setStatus("success");
      setStatusMessage(
        "Your message has been submitted successfully. Thank you for reaching out!",
      );
      setFormData(INITIAL_FORM);
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
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
        "Unable to copy automatically. Please select the email address.",
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
      name: "X",
      href: "https://x.com/DeeptiNanda",
      icon: SiX,
      label: "x.com/DeeptiNanda",
    },
  ];

  return (
    <section
      id="contact"
      className="reveal py-16 sm:py-20 lg:py-28"
      aria-labelledby="contact-heading"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12 lg:mb-16">
          <h2
            id="contact-heading"
            className="section-title text-[var(--foreground)]"
          >
            Let's Connect
          </h2>

          <p className="text-[var(--muted)] mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg leading-relaxed">
            Have a project in mind or just want to say hi? I'd love to hear from
            you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-4xl mx-auto min-w-0">
          {/* Contact Information */}
          <div className="space-y-5 sm:space-y-6 lg:space-y-8 min-w-0">
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 lg:p-8 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4 sm:mb-6">
                Get in Touch
              </h3>

              <div className="space-y-3 sm:space-y-4">
                {socialLinks.map((social) => (
                  <div
                    key={social.name}
                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all hover:bg-[var(--card-border)] group min-w-0"
                  >
                    <a
                      href={social.href}
                      target={
                        social.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        social.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="flex flex-1 min-w-0 items-center gap-3 sm:gap-4"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg flex items-center justify-center text-[var(--accent)] bg-[var(--accent)]/10">
                        <social.icon
                          className="w-5 h-5 sm:w-6 sm:h-6"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-xs sm:text-sm text-[var(--muted)]">
                          {social.name}
                        </p>

                        <p className="text-sm sm:text-base text-[var(--foreground)] font-medium group-hover:text-[var(--accent)] transition-colors break-all">
                          {social.label}
                        </p>
                      </div>
                    </a>

                    {social.copyable && (
                      <button
                        type="button"
                        onClick={copyEmail}
                        className="btn-ghost shrink-0 min-w-10 min-h-10 sm:min-w-11 sm:min-h-11 p-2 transition-colors"
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
                  className="text-xs text-[var(--muted)] min-h-4 px-2"
                  aria-live="polite"
                >
                  {copied ? "Email address copied!" : copyError}
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-4">
                Availability
              </h3>

              <div className="space-y-3 text-sm sm:text-base text-[var(--muted)]">
                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-1.5 shrink-0 rounded-full bg-green-500 animate-pulse" />
                  <span>Open to internships (part-time & ful-time) and job opportunities</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-1.5 shrink-0 rounded-full bg-green-500 animate-pulse" />
                  <span>Available for freelance projects</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-1.5 shrink-0 rounded-full bg-green-500 animate-pulse" />
                  <span>Open to collaboration & open source</span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-1.5 shrink-0 rounded-full bg-blue-500" />
                  <span>Typically responds within 24 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 sm:p-6 lg:p-8 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] mb-5 sm:mb-6">
              Send a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Honeypot field for basic bot filtering */}
              <div
                className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label htmlFor="website">Leave this field empty</label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="min-w-0">
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
                    className="form-input min-h-11 w-full"
                    placeholder="Your name"
                    disabled={status === "submitting"}
                  />
                </div>

                <div className="min-w-0">
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
                    className="form-input min-h-11 w-full"
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
                  className="form-input min-h-11 w-full"
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
                  className="form-input resize-y min-h-[120px] w-full"
                  placeholder="Tell me about your project, opportunity, or just say hello..."
                  disabled={status === "submitting"}
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full min-h-12 flex items-center justify-center gap-3 py-3 sm:py-4"
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
                  className={`text-sm text-center leading-relaxed ${
                    status === "error" ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {statusMessage}
                </p>
              )}

              <p className="text-xs text-[var(--muted)] text-center leading-relaxed">
                By submitting, you agree to share your email for correspondence
                purposes only.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
