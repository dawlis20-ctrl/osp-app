import { prisma } from "@/lib/prisma";

// Next free "N/YYYY": highest number used this year + 1. Unlike counting rows this stays
// correct after numbers have been edited by hand.
export async function suggestReportNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const existing = await prisma.report.findMany({
    where: { number: { endsWith: `/${year}` } },
    select: { number: true },
  });
  const highest = existing.reduce((max, r) => Math.max(max, parseInt(r.number, 10) || 0), 0);
  return `${highest + 1}/${year}`;
}

export async function isReportNumberTaken(number: string, exceptId?: string): Promise<boolean> {
  const found = await prisma.report.findUnique({ where: { number }, select: { id: true } });
  return !!found && found.id !== exceptId;
}
