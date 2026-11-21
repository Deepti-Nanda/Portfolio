
import { Resend } from "resend";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A real message is a few KB at most; reject anything far larger unread.
const MAX_BODY_BYTES = 16 * 1024;

// Rate limits, so scripted spam can't flood the inbox or use up the email
// quota. They're kept in memory, so each server instance counts separately.
const PER_VISITOR_LIMIT = 5;
const PER_VISITOR_WINDOW_MS = 15 * 60 * 1000;
const OVERALL_LIMIT = 40;
const OVERALL_WINDOW_MS = 60 * 60 * 1000;
const MAX_TRACKED_VISITORS = 5000;

const visitorRequests = new Map<string, number[]>();
let overallRequests: number[] = [];

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/** Records a request and returns how many seconds to wait if over a limit. */
function checkRateLimit(ip: string, now: number) {
  overallRequests = overallRequests.filter(
    (time) => now - time < OVERALL_WINDOW_MS,
  );
  const recent = (visitorRequests.get(ip) ?? []).filter(
    (time) => now - time < PER_VISITOR_WINDOW_MS,
  );

  if (recent.length >= PER_VISITOR_LIMIT) {
    return Math.ceil((recent[0] + PER_VISITOR_WINDOW_MS - now) / 1000);
  }

  if (overallRequests.length >= OVERALL_LIMIT) {
    return Math.ceil((overallRequests[0] + OVERALL_WINDOW_MS - now) / 1000);
  }

  // Keep memory bounded: forget the oldest visitors first.
  if (!visitorRequests.has(ip) && visitorRequests.size >= MAX_TRACKED_VISITORS) {
    const oldest = visitorRequests.keys().next().value;
    if (oldest !== undefined) visitorRequests.delete(oldest);
  }

  recent.push(now);
  visitorRequests.set(ip, recent);
  overallRequests.push(now);
  return 0;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request: Request) {
  try {
    const retryAfter = checkRateLimit(getClientIp(request), Date.now());

    if (retryAfter > 0) {
      return Response.json(
        {
          message:
            "Too many messages in a short time. Please try again in a few minutes.",
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    const declaredLength = Number(request.headers.get("content-length"));

    if (declaredLength > MAX_BODY_BYTES) {
      return Response.json(
        { message: "Your message is too large." },
        { status: 413 },
      );
    }

    let body: Record<string, unknown>;

    try {
      const raw = await request.text();

      if (raw.length > MAX_BODY_BYTES) {
        return Response.json(
          { message: "Your message is too large." },
          { status: 413 },
        );
      }

      body = JSON.parse(raw);
    } catch {
      return Response.json(
        { message: "Invalid request format." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return Response.json(
        { message: "Invalid request data." },
        { status: 400 }
      );
    }

    // Honeypot: silently ignore automated bot submissions.
    const website =
      typeof body.website === "string" ? body.website : "";

    if (website.trim()) {
      return Response.json({ message: "Message received." });
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const subject =
      typeof body.subject === "string"
        ? body.subject.replace(/[\r\n]+/g, " ").trim()
        : "";

    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    // Validate required fields.
    if (!name || !email || !subject || !message) {
      return Response.json(
        { message: "Please complete all required fields." },
        { status: 400 }
      );
    }

    // Validate field lengths.
    if (
      name.length > 80 ||
      email.length > 254 ||
      subject.length > 120 ||
      message.length > 5000
    ) {
      return Response.json(
        { message: "One or more fields exceed the allowed length." },
        { status: 400 }
      );
    }

    if (name.length < 2 || subject.length < 2 || message.length < 10) {
      return Response.json(
        { message: "Please provide more complete information." },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return Response.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Read secrets only on the server. Stray spaces from pasting are ignored.
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    const to = process.env.RESEND_TO_EMAIL?.trim();

    if (!apiKey || !from || !to) {
      // Name the missing settings (never their values) to make setup easy.
      const missing = [
        ["RESEND_API_KEY", apiKey],
        ["RESEND_FROM_EMAIL", from],
        ["RESEND_TO_EMAIL", to],
      ]
        .filter(([, value]) => !value)
        .map(([name]) => name);

      console.error(
        `Contact form email configuration is incomplete. Missing: ${missing.join(", ")}`,
      );

      return Response.json(
        { message: "The contact service is not configured yet." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        "",
        "Message:",
        message,
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #222;">
          <h2>New Portfolio Contact Message</h2>

          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>

          <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />

          <h3>Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend delivery error:", error);

      return Response.json(
        { message: "Unable to send your message right now. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({
      message: "Your message was accepted for delivery.",
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return Response.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
