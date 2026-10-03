import { prisma } from "@/lib/prisma";

// Reports are not stored, so the only thing we remember is the highest number used per year.
export async function suggestReportNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const row = await prisma.reportCounter.findUnique({ where: { year } });
  return `${(row?.last ?? 0) + 1}/${year}`;
}

// Called after a report was sent. Hand-typed numbers that don't look like "N/YYYY" are ignored.
export async function rememberReportNumber(number: string): Promise<void> {
  const match = number.trim().match(/^(\d+)\s*\/\s*(\d{4})$/);
  if (!match) return;
  const last = Number(match[1]);
  const year = Number(match[2]);

  const row = await prisma.reportCounter.findUnique({ where: { year } });
  if (!row) await prisma.reportCounter.create({ data: { year, last } });
  else if (last > row.last) await prisma.reportCounter.update({ where: { year }, data: { last } });
}
