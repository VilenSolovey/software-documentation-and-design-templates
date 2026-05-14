export type OutputStrategyType = "file";

export interface FileOutputConfig {
  outputFilePath: string;
}

export interface MedicalExportConfig {
  processing: {
    maxRows?: number;
  };
  output: {
    strategy: OutputStrategyType;
    file: FileOutputConfig;
  };
}

export interface MedicalExportRow {
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
