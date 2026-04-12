import { MedicalRecord } from "../entities/MedicalRecord";

export interface IMedicalRecordRepository {
  save(record: MedicalRecord): Promise<MedicalRecord>;
  saveMany(records: MedicalRecord[]): Promise<MedicalRecord[]>;
  findById(id: string): Promise<MedicalRecord | null>;
  findAll(): Promise<MedicalRecord[]>;
}
