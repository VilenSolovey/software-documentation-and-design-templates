import { Patient } from "../entities/Person";

export interface IPatientRepository {
  save(patient: Patient): Promise<Patient>;
  saveMany(patients: Patient[]): Promise<Patient[]>;
  findById(id: string): Promise<Patient | null>;
  findAll(): Promise<Patient[]>;
}
