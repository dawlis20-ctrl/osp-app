import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderDocxTemplate, DOCX_CONTENT_TYPE } from "@/lib/docx/render";

const CREW_ROLE_PREFIX: Record<string, string> = {
  DOWODCA: "DOWODCA",
  KIEROWCA: "KIEROWCA",
};

export async function GET(_request: Request, { params }: RouteContext<"/reports/[id]/docx">) {
  const { id } = await params;

  const [report, vehicles] = await Promise.all([
    prisma.report.findUnique({
      where: { id },
      include: {
        crew: { include: { member: true } },
        equipment: true,
        otherUnits: true,
        preparedBy: true,
        checkedBy: true,
      },
    }),
    prisma.vehicle.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!report) {
    return new NextResponse("Nie znaleziono raportu", { status: 404 });
  }

  const columnOf = new Map(vehicles.map((v, i) => [v.id, i + 1]));

  const data: Record<string, string> = {
    numer: report.number,
    data: report.date.toLocaleDateString("pl-PL"),
    godzWyjazdu: report.alarmTime,
    godzPowrotu: report.returnTime,
    alarmowal: report.alarmedBy || "",
    godzDojazdu: report.arrivalTime,
    godzOdjazdu: report.departureTime,
    adres: report.address,
    mzLabel: report.purpose === "MZ" ? "[MZ]" : "MZ",
    pLabel: report.purpose === "P" ? "[P]" : "P",
    afLabel: report.purpose === "AF" ? "[AF]" : "AF",
    celOpis: report.purposeDescription || "",
    kpp: report.kpp || "",
    przekazanie: report.handover || "",
    uwagi: report.notes || "",
    preparedByName: report.preparedBy?.name || "",
    checkedByName: report.checkedBy?.name || "",
  };

  // 3x puste stringi domyślnie dla każdej roli/kolumny, żeby żaden tag nie został nierozwinięty
  for (let col = 1; col <= 3; col++) {
    data[`crew_${col}_DOWODCA`] = "";
    data[`crew_${col}_KIEROWCA`] = "";
    for (let pos = 1; pos <= 4; pos++) data[`crew_${col}_RATOWNIK_${pos}`] = "";
  }
  for (let pos = 5; pos <= 7; pos++) data[`crew_1_RATOWNIK_${pos}`] = "";

  for (const entry of report.crew) {
    const col = columnOf.get(entry.vehicleId);
    if (!col || !entry.member) continue;
    if (entry.role === "RATOWNIK") {
      data[`crew_${col}_RATOWNIK_${entry.position}`] = entry.member.name;
    } else {
      data[`crew_${col}_${CREW_ROLE_PREFIX[entry.role]}`] = entry.member.name;
    }
  }

  for (let i = 1; i <= 3; i++) {
    const eq = report.equipment[i - 1];
    data[`equip${i}Name`] = eq?.name || "";
    data[`equip${i}Time`] = eq?.workTime || "";
    data[`equip${i}Notes`] = eq?.notes || "";
  }

  for (let i = 1; i <= 6; i++) {
    data[`otherUnit${i}`] = report.otherUnits[i - 1]?.name || "";
  }

  const buffer = renderDocxTemplate("raport-template.docx", data);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_CONTENT_TYPE,
      "Content-Disposition": `attachment; filename="raport-${report.number.replace("/", "-")}.docx"`,
    },
  });
}
