import nodemailer from "nodemailer";

// Total size of all attachments; keeps a comfortable margin under typical mailbox limits (~20 MB).
export const MAX_ATTACHMENTS_BYTES = 15 * 1024 * 1024;

export type MailAttachment = { filename: string; content: Buffer; contentType: string };

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
  attachments: MailAttachment[];
}): Promise<void> {
  const total = opts.attachments.reduce((sum, a) => sum + a.content.length, 0);
  if (total > MAX_ATTACHMENTS_BYTES) {
    throw new Error("Załączniki są za duże do wysłania e-mailem (ponad 15 MB). Zmniejsz liczbę zdjęć.");
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: requireEnv("SMTP_USER"), pass: requireEnv("SMTP_PASS") },
  });

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || requireEnv("SMTP_USER"),
      to: requireEnv("OSP_EMAIL_TO"),
      subject: opts.subject,
      text: opts.text,
      attachments: opts.attachments,
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "EAUTH") throw new Error("Serwer poczty odrzucił login lub hasło (SMTP_USER / SMTP_PASS).");
    if (code === "ECONNREFUSED" || code === "ETIMEDOUT" || code === "ENOTFOUND" || code === "ECONNECTION") {
      throw new Error("Nie można połączyć się z serwerem poczty (sprawdź SMTP_HOST i SMTP_PORT).");
    }
    throw error;
  }
}
