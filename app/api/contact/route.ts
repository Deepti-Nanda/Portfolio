
import { Resend } from "resend";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    let body: Record<string, unknown>;

    try {
      body = await request.json();
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

    // Read secrets only on the server.
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL;
    const to = process.env.RESEND_TO_EMAIL;

    if (!apiKey || !from || !to) {
      console.error("Contact form email configuration is incomplete.");

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

    const { data, error } = await resend.emails.send({
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
      id: data?.id,
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return Response.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
