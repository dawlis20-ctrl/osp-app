import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Helvetica's built-in encoding has no Polish diacritics (ą ć ę ł ń ó ś ź ż),
// so we embed a Unicode font instead of using the PDF standard fonts.
Font.register({
  family: "Noto Sans",
  fonts: [
    { src: path.join(process.cwd(), "src/lib/pdf/fonts/NotoSans-Regular.woff") },
    { src: path.join(process.cwd(), "src/lib/pdf/fonts/NotoSans-Bold.woff"), fontWeight: 700 },
  ],
});

export type CrewCell = {
  vehicleId: string;
  role: "DOWODCA" | "KIEROWCA" | "RATOWNIK";
  position: number;
  memberName: string | null;
};

export type ReportPdfData = {
  number: string;
  typeLabel: string;
  dateLabel: string;
  alarmTime: string;
  arrivalTime: string;
  departureTime: string;
  returnTime: string;
  alarmedBy: string;
  address: string;
  purposeCode: string;
  purposeDescription: string | null;
  vehicles: { id: string; name: string; plate: string }[];
  crew: CrewCell[];
  equipment: { name: string; workTime: string; notes: string | null }[];
  otherUnits: string[];
  kpp: string | null;
  handover: string | null;
  notes: string | null;
  preparedByName: string | null;
  checkedByName: string | null;
};

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 9.5, fontFamily: "Noto Sans", color: "#111" },
  title: { fontSize: 15, fontWeight: 700, textAlign: "center", marginBottom: 2 },
  subtitle: { fontSize: 9, textAlign: "center", marginBottom: 14, color: "#333" },
  fieldRow: { flexDirection: "row", marginBottom: 5, flexWrap: "wrap" },
  field: { flexDirection: "row", marginRight: 18, marginBottom: 2 },
  fieldLabel: { fontWeight: 700, marginRight: 4 },
  section: { marginTop: 12, marginBottom: 5, fontWeight: 700, fontSize: 10.5 },
  purposeRow: { flexDirection: "row", marginBottom: 6 },
  purposeOption: {
    borderWidth: 1,
    borderColor: "#000",
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 6,
  },
  purposeOptionActive: { backgroundColor: "#eee", fontWeight: 700 },
  table: { borderWidth: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row" },
  th: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#eee",
    padding: 4,
    fontWeight: 700,
    fontSize: 8.5,
  },
  td: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    fontSize: 8.5,
  },
  noBorderRight: { borderRightWidth: 0 },
  textBlock: { marginBottom: 4, lineHeight: 1.4 },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  signBox: { width: "45%", textAlign: "center" },
  signLine: { borderTopWidth: 1, borderColor: "#000", marginTop: 24, paddingTop: 2, fontSize: 8.5 },
});

const crewRoleLabel: Record<CrewCell["role"], string> = {
  DOWODCA: "Dowódca",
  KIEROWCA: "Kierowca",
  RATOWNIK: "Ratownik",
};

export function ReportDocument({ data }: { data: ReportPdfData }) {
  const roleRows: { role: CrewCell["role"]; position: number; label: string }[] = [
    { role: "DOWODCA", position: 1, label: "Dowódca" },
    { role: "KIEROWCA", position: 1, label: "Kierowca" },
    ...Array.from({ length: 6 }, (_, i) => ({
      role: "RATOWNIK" as const,
      position: i + 1,
      label: `Ratownik ${i + 1}`,
    })),
  ];

  const colWidth = `${100 / (data.vehicles.length + 1)}%`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Raport nr {data.number}</Text>
        <Text style={styles.subtitle}>
          z przeprowadzonej {data.typeLabel} w dniu: {data.dateLabel}
        </Text>

        <View style={styles.fieldRow}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Godz. wyjazdu:</Text>
            <Text>{data.alarmTime}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Godz. dojazdu:</Text>
            <Text>{data.arrivalTime}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Godz. odjazdu:</Text>
            <Text>{data.departureTime}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Godz. powrotu:</Text>
            <Text>{data.returnTime}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Alarmował:</Text>
            <Text>{data.alarmedBy || "—"}</Text>
          </View>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Adres zgłoszenia:</Text>
            <Text>{data.address}</Text>
          </View>
        </View>

        <View style={styles.purposeRow}>
          <Text style={styles.fieldLabel}>Cel wyjazdu:</Text>
          {["MZ", "P", "AF"].map((code) => (
            <View
              key={code}
              style={[styles.purposeOption, ...(data.purposeCode === code ? [styles.purposeOptionActive] : [])]}
            >
              <Text>{code}</Text>
            </View>
          ))}
          <Text style={{ marginLeft: 8 }}>{data.purposeDescription || ""}</Text>
        </View>

        <Text style={styles.section}>W akcji udział wzięli</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={[styles.th, { width: colWidth }]}>
              <Text> </Text>
            </View>
            {data.vehicles.map((v, i) => (
              <View
                key={v.id}
                style={[
                  styles.th,
                  { width: colWidth },
                  ...(i === data.vehicles.length - 1 ? [styles.noBorderRight] : []),
                ]}
              >
                <Text>{v.name}</Text>
                <Text>{v.plate}</Text>
              </View>
            ))}
          </View>
          {roleRows.map((row) => (
            <View style={styles.tableRow} key={`${row.role}-${row.position}`}>
              <View style={[styles.td, { width: colWidth }]}>
                <Text>{row.label}</Text>
              </View>
              {data.vehicles.map((v, i) => {
                const cell = data.crew.find(
                  (c) => c.vehicleId === v.id && c.role === row.role && c.position === row.position
                );
                return (
                  <View
                    key={v.id}
                    style={[
                      styles.td,
                      { width: colWidth },
                      ...(i === data.vehicles.length - 1 ? [styles.noBorderRight] : []),
                    ]}
                  >
                    <Text>{cell?.memberName ?? ""}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {data.equipment.length > 0 && (
          <>
            <Text style={styles.section}>Praca sprzętu spalinowego</Text>
            <View style={styles.table}>
              <View style={styles.tableRow}>
                <View style={[styles.th, { width: "40%" }]}>
                  <Text>Rodzaj sprzętu</Text>
                </View>
                <View style={[styles.th, { width: "20%" }]}>
                  <Text>Czas pracy</Text>
                </View>
                <View style={[styles.th, { width: "40%" }, styles.noBorderRight]}>
                  <Text>Uwagi</Text>
                </View>
              </View>
              {data.equipment.map((e, i) => (
                <View style={styles.tableRow} key={i}>
                  <View style={[styles.td, { width: "40%" }]}>
                    <Text>{e.name}</Text>
                  </View>
                  <View style={[styles.td, { width: "20%" }]}>
                    <Text>{e.workTime}</Text>
                  </View>
                  <View style={[styles.td, { width: "40%" }, styles.noBorderRight]}>
                    <Text>{e.notes ?? ""}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {data.otherUnits.length > 0 && (
          <>
            <Text style={styles.section}>Inne jednostki biorące udział</Text>
            <Text style={styles.textBlock}>{data.otherUnits.join(", ")}</Text>
          </>
        )}

        <Text style={styles.section}>
          Udzielono kwalifikowanej pierwszej pomocy (imię i nazwisko)
        </Text>
        <Text style={styles.textBlock}>{data.kpp || "—"}</Text>

        <Text style={styles.section}>Przekazanie miejsca zdarzenia (imię i nazwisko)</Text>
        <Text style={styles.textBlock}>{data.handover || "—"}</Text>

        <Text style={styles.section}>Uwagi</Text>
        <Text style={styles.textBlock}>{data.notes || "—"}</Text>

        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLine}>{data.preparedByName || ""}</Text>
            <Text>dowódca (raport sporządził)</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLine}>{data.checkedByName || ""}</Text>
            <Text>naczelnik (raport sprawdził)</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
