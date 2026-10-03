import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const WINDOWS_DEFAULT = "C:\\Program Files\\LibreOffice\\program\\soffice.exe";

function sofficePath(): string {
  if (process.env.SOFFICE_PATH) return process.env.SOFFICE_PATH;
  if (process.platform === "win32" && existsSync(WINDOWS_DEFAULT)) return WINDOWS_DEFAULT;
  return "soffice";
}

function run(bin: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(bin, args, { timeout: timeoutMs, windowsHide: true }, (error, _stdout, stderr) => {
      if (error) reject(new Error(`LibreOffice: ${error.message}${stderr ? ` — ${stderr}` : ""}`));
      else resolve();
    });
  });
}

// LibreOffice does not tolerate two conversions sharing one profile at the same time,
// so every conversion waits for the previous one.
let queue: Promise<unknown> = Promise.resolve();

export function docxToPdf(docx: Buffer): Promise<Buffer> {
  const job = queue.then(() => convert(docx));
  queue = job.catch(() => undefined);
  return job;
}

async function convert(docx: Buffer): Promise<Buffer> {
  const workDir = path.join(os.tmpdir(), `osp-pdf-${randomUUID()}`);
  const profileDir = path.join(os.tmpdir(), "osp-soffice-profile");
  await fs.mkdir(workDir, { recursive: true });

  try {
    const input = path.join(workDir, "document.docx");
    await fs.writeFile(input, docx);

    await run(
      sofficePath(),
      [
        `-env:UserInstallation=${pathToFileURL(profileDir).href}`,
        "--headless",
        "--norestore",
        "--convert-to",
        "pdf",
        "--outdir",
        workDir,
        input,
      ],
      90_000
    );

    return await fs.readFile(path.join(workDir, "document.pdf"));
  } finally {
    await fs.rm(workDir, { recursive: true, force: true });
  }
}
