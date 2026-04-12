import { Doctor } from "../entities/Person";

export interface IDoctorRepository {
  save(doctor: Doctor): Promise<Doctor>;
  saveMany(doctors: Doctor[]): Promise<Doctor[]>;
  findById(id: string): Promise<Doctor | null>;
  findAll(): Promise<Doctor[]>;
}
