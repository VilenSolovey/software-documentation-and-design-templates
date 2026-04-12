import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { MedicalRecord } from "../entities/MedicalRecord";
import { IMedicalRecordRepository } from "../interfaces/IMedicalRecordRepository";
import { appDataSource } from "../../data-source";

@injectable()
export class MedicalRecordRepository implements IMedicalRecordRepository {
  private readonly ds: DataSource;

  constructor() {
    this.ds = appDataSource;
  }

  async save(record: MedicalRecord): Promise<MedicalRecord> {
    return this.ds.getRepository(MedicalRecord).save(record);
  }

  async saveMany(records: MedicalRecord[]): Promise<MedicalRecord[]> {
    if (records.length === 0) return [];
    return this.ds.getRepository(MedicalRecord).save(records);
  }

  async findById(id: string): Promise<MedicalRecord | null> {
    return this.ds.getRepository(MedicalRecord).findOneBy({ recordId: id });
  }

  async findAll(): Promise<MedicalRecord[]> {
    return this.ds.getRepository(MedicalRecord).find();
  }
}
