export interface MedicalCsvRow {
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

export interface ICsvReader {
  readFile(filePath: string): Promise<MedicalCsvRow[]>;
}
