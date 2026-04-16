import { Resend } from "resend";

let resend: Resend | null = null;

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!resend) {
    resend = new Resend(key);
  }
  return resend;
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL;
  if (!from?.trim()) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }
  return from.trim();
}

export type SendWelcomeEmailParams = {
  to: string;
  name?: string | null;
};

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  const client = getResend();
  const from = getFromAddress();
  const displayName = name?.trim() || "there";

  const { data, error } = await client.emails.send({
    from,
    to,
    subject: "Welcome",
    html: `<p>Hi ${escapeHtml(displayName)},</p><p>Thanks for signing up.</p>`,
    text: `Hi ${displayName},\n\nThanks for signing up.`,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
