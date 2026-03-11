import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";

const FIRST_NAMES = [
  "Олена", "Віленсіс", "Марія", "Джон", "Тетяна", "Андрій", "Ольга", "Сергій",
  "Юлія", "Василь", "Надія", "Віра", "Любов", "Максим", "Елізабет", "Артем",
  "Галина", "Роман", "Вікторія", "Ахмед",
];

const LAST_NAMES = [
  "Шевченко", "Коваленко", "Бондаренко", "Кравченко", "Мельник", "Климenko",
  "Поліщук", "Савченко", "Гончаренко", "Тимошенко", "Павленко", "Романенко",
  "Марченко", "Шевченко", "Петренко", "Яременко", "Захаренко", "Сидоренко",
  "Ярмоленко", "Зінченко",
];

const SPECIALIZATIONS = [
  "Кардіологія", "Неврологія", "Онкологія", "Педіатрія", "Хірургія",
  "Травматологія", "Ендокринологія", "Гастроентерологія", "Офтальмологія",
  "Дерматологія",
];

const SAMPLE_TYPES = [
  "Венозна кров", "Капілярна кров", "Сеча", "Слина", "Ліквор",
  "Мокрота", "Жовч", "Синовіальна рідина",
];

const SCAN_REGIONS = [
  "Голова", "Шия", "Грудна клітка", "Черевна порожнина", "Малий таз",
  "Хребет", "Коліно", "Плечо", "Поперек", "Серце",
];

const EXAM_STATUSES = ["scheduled", "completed", "cancelled", "in_progress"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): string {
  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts).toISOString().slice(0, 10); 
}

function randomDatetime(start: Date, end: Date): string {
  const ts = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts).toISOString();
}

function fullName(): string {
  return `${randomItem(LAST_NAMES)} ${randomItem(FIRST_NAMES)}`;
}

interface PersonSeed {
  id: string;
  name: string;
  dob: string;
}

interface PatientSeed extends PersonSeed {
  recordId: string;
}

interface DoctorSeed extends PersonSeed {
  specialization: string;
}

function generatePatients(count: number): PatientSeed[] {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    name: fullName(),
    dob: randomDate(new Date("1950-01-01"), new Date("2000-12-31")),
    recordId: uuidv4(),
  }));
}

function generateDoctors(count: number): DoctorSeed[] {
  return Array.from({ length: count }, () => ({
    id: uuidv4(),
    name: fullName(),
    dob: randomDate(new Date("1960-01-01"), new Date("1990-12-31")),
    specialization: randomItem(SPECIALIZATIONS),
  }));
}

interface CsvRow {
  patientId: string;
  patientName: string;
  patientDob: string;
  doctorId: string;
  doctorName: string;
  doctorDob: string;
  doctorSpecialization: string;
  recordId: string;
  examinationId: string;
  examinationType: "blood_test" | "mri";
  examinationDate: string;
  examinationStatus: string;
  sampleType: string;
  scanRegion: string;
  resultId: string;
  resultType: string;
  resultFilePath: string;
  resultCreatedAt: string;
}

function buildRows(
  patients: PatientSeed[],
  doctors: DoctorSeed[],
  totalRows: number,
): CsvRow[] {
  const rows: CsvRow[] = [];
  const examStart = new Date("2020-01-01");
  const examEnd   = new Date("2025-12-31");

  while (rows.length < totalRows) {
    const patient = randomItem(patients);
    const doctor  = randomItem(doctors);
    const isBlood = Math.random() < 0.6; 
    const exType: "blood_test" | "mri" = isBlood ? "blood_test" : "mri";
    const examDate = randomDate(examStart, examEnd);

    rows.push({
      patientId:           patient.id,
      patientName:         patient.name,
      patientDob:          patient.dob,
      doctorId:            doctor.id,
      doctorName:          doctor.name,
      doctorDob:           doctor.dob,
      doctorSpecialization: doctor.specialization,
      recordId:            patient.recordId,
      examinationId:       uuidv4(),
      examinationType:     exType,
      examinationDate:     examDate,
      examinationStatus:   randomItem(EXAM_STATUSES),
      sampleType:          isBlood ? randomItem(SAMPLE_TYPES) : "",
      scanRegion:          !isBlood ? randomItem(SCAN_REGIONS) : "",
      resultId:            uuidv4(),
      resultType:          isBlood ? "blood_analysis" : "mri_scan",
      resultFilePath:      `results/${uuidv4()}.pdf`,
      resultCreatedAt:     randomDatetime(new Date(examDate), examEnd),
    });
  }

  return rows;
}


const HEADERS: (keyof CsvRow)[] = [
  "patientId", "patientName", "patientDob",
  "doctorId", "doctorName", "doctorDob", "doctorSpecialization",
  "recordId",
  "examinationId", "examinationType", "examinationDate", "examinationStatus",
  "sampleType", "scanRegion",
  "resultId", "resultType", "resultFilePath", "resultCreatedAt",
];

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function rowToCsvLine(row: CsvRow): string {
  return HEADERS.map((h) => escapeCsvField(String(row[h]))).join(",");
}

function buildCsvContent(rows: CsvRow[]): string {
  const header = HEADERS.join(",");
  const lines  = rows.map(rowToCsvLine);
  return [header, ...lines].join("\n") + "\n";
}

function main(): void {
  const args       = process.argv.slice(2);
  const outputPath = args[0]
    ? path.resolve(args[0])
    : path.resolve(__dirname, "../../data/medical_data.csv");
  const rowCount   = args[1] ? parseInt(args[1], 10) : 1000;

  if (isNaN(rowCount) || rowCount < 1) {
    console.error("Row count must be a positive integer.");
    process.exit(1);
  }

  console.log(`Generating ${rowCount} rows → ${outputPath}`);

  const patients = generatePatients(20);
  const doctors  = generateDoctors(10);
  const rows     = buildRows(patients, doctors, rowCount);
  const csv      = buildCsvContent(rows);

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, csv, "utf-8");
  console.log(`Done. File size: ${(csv.length / 1024).toFixed(1)} KB, rows: ${rows.length}`);
}

main();
