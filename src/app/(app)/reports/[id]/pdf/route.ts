import { NextResponse } from "next/server";
import { createElement } from "react";
import type { ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { ReportDocument, type ReportPdfData } from "@/lib/pdf/ReportDocument";
import { reportTypeGenitiveLabels } from "@/lib/labels";

export async function GET(_request: Request, { params }: RouteContext<"/reports/[id]/pdf">) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      crew: { include: { vehicle: true, member: true }, orderBy: [{ vehicleId: "asc" }, { position: "asc" }] },
      equipment: true,
      otherUnits: true,
      preparedBy: true,
      checkedBy: true,
    },
  });

  if (!report) {
    return new NextResponse("Nie znaleziono raportu", { status: 404 });
  }

  const vehicleMap = new Map<string, { id: string; name: string; plate: string }>();
  for (const c of report.crew) {
    if (!vehicleMap.has(c.vehicleId)) {
      vehicleMap.set(c.vehicleId, { id: c.vehicle.id, name: c.vehicle.name, plate: c.vehicle.plate });
    }
  }
  let vehicles = [...vehicleMap.values()];
  if (vehicles.length === 0) {
    const active = await prisma.vehicle.findMany({ where: { active: true } });
    vehicles = active.map((v) => ({ id: v.id, name: v.name, plate: v.plate }));
  }

  const data: ReportPdfData = {
    number: report.number,
    typeLabel: reportTypeGenitiveLabels[report.type],
    dateLabel: report.date.toLocaleDateString("pl-PL"),
    alarmTime: report.alarmTime,
    arrivalTime: report.arrivalTime,
    departureTime: report.departureTime,
    returnTime: report.returnTime,
    alarmedBy: report.alarmedBy,
    address: report.address,
    purposeCode: report.purpose,
    purposeDescription: report.purposeDescription,
    vehicles,
    crew: report.crew.map((c) => ({
      vehicleId: c.vehicleId,
      role: c.role,
      position: c.position,
      memberName: c.member?.name ?? null,
    })),
    equipment: report.equipment.map((e) => ({ name: e.name, workTime: e.workTime, notes: e.notes })),
    otherUnits: report.otherUnits.map((o) => o.name),
    kpp: report.kpp,
    handover: report.handover,
    notes: report.notes,
    preparedByName: report.preparedBy?.name ?? null,
    checkedByName: report.checkedBy?.name ?? null,
  };

  const element = createElement(ReportDocument, { data }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="raport-${report.number.replace("/", "-")}.pdf"`,
    },
  });
}
