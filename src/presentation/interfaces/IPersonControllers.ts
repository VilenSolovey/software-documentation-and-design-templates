import { Patient } from "../../dal/entities/Person";
import { Doctor } from "../../dal/entities/Person";

export interface IPatientController {
  getAll(): Promise<Patient[]>;
  getById(id: string): Promise<Patient | null>;
}

export interface IDoctorController {
  getAll(): Promise<Doctor[]>;
  getById(id: string): Promise<Doctor | null>;
}
