import { MedicalExportRow } from "../types";

export const MEDICAL_EXPORT_HEADERS: (keyof MedicalExportRow)[] = [
  "patientId",
  "patientName",
  "patientDob",
  "doctorId",
  "doctorName",
  "doctorDob",
  "doctorSpecialization",
  "recordId",
  "examinationId",
  "examinationType",
  "examinationDate",
  "examinationStatus",
  "sampleType",
  "scanRegion",
  "resultId",
  "resultType",
  "resultFilePath",
  "resultCreatedAt",
];

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function formatMedicalExportHeader(): string {
  return MEDICAL_EXPORT_HEADERS.join(",");
}

export function formatMedicalExportRow(row: MedicalExportRow): string {
  return MEDICAL_EXPORT_HEADERS.map((header) => escapeCsvField(String(row[header]))).join(",");
}
