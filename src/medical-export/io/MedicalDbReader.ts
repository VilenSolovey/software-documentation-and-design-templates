import { BloodTest, Examination, MRI } from "../../dal/entities/Examination";
import { IExaminationRepository } from "../../dal/interfaces/IExaminationRepository";
import { MedicalExportRow } from "../types";

function toDate(value?: Date | string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: Date | string | null): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: Date | string | null): string {
  const date = toDate(value);
  if (!date) {
    return "";
  }

  return date.toISOString();
}

export class MedicalDbReader {
  constructor(private readonly examinationRepository: IExaminationRepository) {}

  async read(): Promise<MedicalExportRow[]> {
    const examinations = await this.examinationRepository.findAll();
    return examinations.map((examination) => this.mapExamination(examination));
  }

  private mapExamination(examination: Examination): MedicalExportRow {
    const patient = examination.patient;
    const doctor = examination.doctor;
    const result = examination.result;

    return {
      patientId: patient?.id ?? "",
      patientName: patient?.name ?? "",
      patientDob: formatDate(patient?.dateOfBirth),
      doctorId: doctor?.id ?? "",
      doctorName: doctor?.name ?? "",
      doctorDob: formatDate(doctor?.dateOfBirth),
      doctorSpecialization: doctor?.specialization ?? "",
      recordId: result?.medicalRecord?.recordId ?? patient?.medicalRecord?.recordId ?? "",
      examinationId: examination.id,
      examinationType: examination instanceof BloodTest ? "blood_test" : "mri",
      examinationDate: formatDate(examination.date),
      examinationStatus: examination.status ?? "",
      sampleType: examination instanceof BloodTest ? examination.sampleType ?? "" : "",
      scanRegion: examination instanceof MRI ? examination.scanRegion ?? "" : "",
      resultId: result?.id ?? "",
      resultType: result?.type ?? "",
      resultFilePath: result?.filePath ?? "",
      resultCreatedAt: formatDateTime(result?.createdAt),
    };
  }
}
