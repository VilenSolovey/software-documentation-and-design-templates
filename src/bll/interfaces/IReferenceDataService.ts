export interface PatientOption {
  id: string;
  name: string;
  medicalRecordId: string | null;
}

export interface DoctorOption {
  id: string;
  name: string;
  specialization: string;
}

export interface IReferenceDataService {
  getPatients(): Promise<PatientOption[]>;
  getDoctors(): Promise<DoctorOption[]>;
}
