import nodemailer from "nodemailer";

// Keeps a comfortable margin under typical mailbox limits (OVH ~20 MB per message).
export const MAX_ATTACHMENT_BYTES = 12 * 1024 * 1024;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Brak ustawienia ${name} w pliku .env — poczta nie jest skonfigurowana.`);
  return value;
}

export function isMailConfigured(): boolean {
  return ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "OSP_EMAIL_TO"].every((k) => !!process.env[k]);
}

export async function sendToOsp(opts: {
  subject: string;
  text: string;
  attachment: { filename: string; content: Buffer };
}): Promise<void> {
  if (opts.attachment.content.length > MAX_ATTACHMENT_BYTES) {
    throw new Error("Załącznik jest za duży do wysłania e-mailem (ponad 12 MB). Zmniejsz liczbę zdjęć.");
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || requireEnv("SMTP_USER"),
    to: requireEnv("OSP_EMAIL_TO"),
    subject: opts.subject,
    text: opts.text,
    attachments: [
      { filename: opts.attachment.filename, content: opts.attachment.content, contentType: "application/pdf" },
    ],
  });
}
