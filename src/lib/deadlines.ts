export type Urgency = "overdue" | "soon" | "warning" | "ok";

export function daysUntil(date: Date): number {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = date.getTime() - startOfToday.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function urgencyOf(date: Date): Urgency {
  const days = daysUntil(date);
  if (days < 0) return "overdue";
  if (days <= 7) return "soon";
  if (days <= 30) return "warning";
  return "ok";
}

export const urgencyStyles: Record<Urgency, { dot: string; badge: string; label: string }> = {
  overdue: {
    dot: "bg-red-600",
    badge: "bg-red-50 text-red-700 border border-red-200",
    label: "Przeterminowane",
  },
  soon: {
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-700 border border-red-200",
    label: "Poniżej 7 dni",
  },
  warning: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    label: "Poniżej 30 dni",
  },
  ok: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    label: "Termin odległy",
  },
};
