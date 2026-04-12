export const TOKENS = {
  ICsvReader: Symbol("ICsvReader"),
  IPatientRepository: Symbol("IPatientRepository"),
  IDoctorRepository: Symbol("IDoctorRepository"),
  IMedicalRecordRepository: Symbol("IMedicalRecordRepository"),
  IExaminationRepository: Symbol("IExaminationRepository"),
  IResultRepository: Symbol("IResultRepository"),

  IDataImportService: Symbol("IDataImportService"),
  IExaminationService: Symbol("IExaminationService"),
  IReferenceDataService: Symbol("IReferenceDataService"),
  IExaminationWebController: Symbol("IExaminationWebController"),
} as const;
