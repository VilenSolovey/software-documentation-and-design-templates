export type ExaminationStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type ExaminationType = "blood_test" | "mri";

export interface ExaminationInput {
  patientId: string;
  doctorId: string;
  date: string;
  status: ExaminationStatus;
  examinationType: ExaminationType;
  sampleType?: string;
  scanRegion?: string;
  resultType?: string;
  resultFilePath?: string;
  resultCreatedAt?: string;
}

export interface ExaminationSummary {
  id: string;
  patientName: string;
  doctorName: string;
  examinationType: ExaminationType;
  date: string;
  status: ExaminationStatus;
  resultType: string | null;
}

export interface ExaminationDetails extends ExaminationSummary {
  patientId: string;
  patientDateOfBirth: string;
  doctorId: string;
  doctorSpecialization: string;
  sampleType: string | null;
  scanRegion: string | null;
  resultId: string | null;
  resultFilePath: string | null;
  resultCreatedAt: string | null;
  medicalRecordId: string | null;
}

export interface IExaminationService {
  listExaminations(): Promise<ExaminationSummary[]>;
  getExaminationById(id: string): Promise<ExaminationDetails | null>;
  createExamination(input: ExaminationInput): Promise<string>;
  updateExamination(id: string, input: ExaminationInput): Promise<void>;
  deleteExamination(id: string): Promise<boolean>;
  countExaminations(): Promise<number>;
}
