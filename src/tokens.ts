export const TOKENS = {
  ICsvReader: Symbol("ICsvReader"),
  IPatientRepository: Symbol("IPatientRepository"),
  IDoctorRepository: Symbol("IDoctorRepository"),
  IMedicalRecordRepository: Symbol("IMedicalRecordRepository"),
  IExaminationRepository: Symbol("IExaminationRepository"),
  IResultRepository: Symbol("IResultRepository"),

  IDataImportService: Symbol("IDataImportService"),
} as const;
