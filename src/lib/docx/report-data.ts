import { EQUIPMENT_SLOTS, OTHER_UNIT_SLOTS, RATOWNIK_EXTRA_SLOTS, RATOWNIK_SLOTS } from "@/lib/report-form";

export function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

// "2026-10-03" (from <input type="date">) -> "03.10.2026". No Date object, so no timezone surprises.
export function plDate(iso: string, shortYear = false): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  return `${m[3]}.${m[2]}.${shortYear ? m[1].slice(2) : m[1]}`;
}

// Turns the submitted form into the tag values of raport-template.docx.
// Vehicles must be in the same order as the template columns (ordered by name: GBA, GCBA, SLRR).
export function buildReportData(form: FormData, vehicles: { id: string }[]) {
  const purpose = text(form, "purpose");
  const number = text(form, "number");
  const dateLabel = plDate(text(form, "date"));
  const address = text(form, "address");

  const data: Record<string, string> = {
    numer: number,
    data: dateLabel,
    godzWyjazdu: text(form, "alarmTime"),
    godzPowrotu: text(form, "returnTime"),
    alarmowal: text(form, "alarmedBy"),
    godzDojazdu: text(form, "arrivalTime"),
    godzOdjazdu: text(form, "departureTime"),
    adres: address,
    mzLabel: purpose === "MZ" ? "[MZ]" : "MZ",
    pLabel: purpose === "P" ? "[P]" : "P",
    afLabel: purpose === "AF" ? "[AF]" : "AF",
    celOpis: text(form, "purposeDescription"),
    kpp: text(form, "kpp"),
    przekazanie: text(form, "handover"),
    uwagi: text(form, "notes"),
    preparedByName: text(form, "preparedBy"),
    checkedByName: text(form, "checkedBy"),
  };

  // Every tag gets a value (empty by default) so none is left unresolved in the document.
  for (let col = 1; col <= 3; col++) {
    data[`crew_${col}_DOWODCA`] = "";
    data[`crew_${col}_KIEROWCA`] = "";
    for (let pos = 1; pos <= RATOWNIK_SLOTS; pos++) data[`crew_${col}_RATOWNIK_${pos}`] = "";
  }
  for (let pos = RATOWNIK_SLOTS + 1; pos <= RATOWNIK_SLOTS + RATOWNIK_EXTRA_SLOTS; pos++) {
    data[`crew_1_RATOWNIK_${pos}`] = "";
  }

  vehicles.slice(0, 3).forEach((vehicle, index) => {
    const col = index + 1;
    data[`crew_${col}_DOWODCA`] = text(form, `crew_${vehicle.id}_DOWODCA_1`);
    data[`crew_${col}_KIEROWCA`] = text(form, `crew_${vehicle.id}_KIEROWCA_1`);
    const slots = col === 1 ? RATOWNIK_SLOTS + RATOWNIK_EXTRA_SLOTS : RATOWNIK_SLOTS;
    for (let pos = 1; pos <= slots; pos++) {
      data[`crew_${col}_RATOWNIK_${pos}`] = text(form, `crew_${vehicle.id}_RATOWNIK_${pos}`);
    }
  });

  for (let i = 1; i <= EQUIPMENT_SLOTS; i++) {
    data[`equip${i}Name`] = text(form, `equipment_name_${i}`);
    data[`equip${i}Time`] = text(form, `equipment_time_${i}`);
    data[`equip${i}Notes`] = text(form, `equipment_notes_${i}`);
  }

  for (let i = 1; i <= OTHER_UNIT_SLOTS; i++) {
    data[`otherUnit${i}`] = text(form, `otherUnit_${i}`);
  }

  return { data, number, dateLabel, address };
}
