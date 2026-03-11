import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { Patient } from "../entities/Person";
import { IPatientRepository } from "../interfaces/IPatientRepository";
import { appDataSource } from "../../data-source";

@injectable()
export class PatientRepository implements IPatientRepository {
  private readonly ds: DataSource;

  constructor() {
    this.ds = appDataSource;
  }

  async save(patient: Patient): Promise<Patient> {
    return this.ds.getRepository(Patient).save(patient);
  }

  async saveMany(patients: Patient[]): Promise<Patient[]> {
    if (patients.length === 0) return [];
    return this.ds.getRepository(Patient).save(patients);
  }

  async findById(id: string): Promise<Patient | null> {
    return this.ds.getRepository(Patient).findOneBy({ id });
  }

  async findAll(): Promise<Patient[]> {
    return this.ds.getRepository(Patient).find();
  }
}
