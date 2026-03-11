import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { Doctor } from "../entities/Person";
import { IDoctorRepository } from "../interfaces/IDoctorRepository";
import { appDataSource } from "../../data-source";

@injectable()
export class DoctorRepository implements IDoctorRepository {
  private readonly ds: DataSource;

  constructor() {
    this.ds = appDataSource;
  }

  async save(doctor: Doctor): Promise<Doctor> {
    return this.ds.getRepository(Doctor).save(doctor);
  }

  async saveMany(doctors: Doctor[]): Promise<Doctor[]> {
    if (doctors.length === 0) return [];
    return this.ds.getRepository(Doctor).save(doctors);
  }

  async findById(id: string): Promise<Doctor | null> {
    return this.ds.getRepository(Doctor).findOneBy({ id });
  }

  async findAll(): Promise<Doctor[]> {
    return this.ds.getRepository(Doctor).find();
  }
}
