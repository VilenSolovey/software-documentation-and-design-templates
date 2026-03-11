import "reflect-metadata";
import { DataSource } from "typeorm";
import { Person, Patient, Doctor } from "./dal/entities/Person";
import { MedicalRecord } from "./dal/entities/MedicalRecord";
import { Examination, BloodTest, MRI } from "./dal/entities/Examination";
import { Result } from "./dal/entities/Result";
import * as path from "path";

export const appDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.resolve(__dirname, "../data/medical.db"),
  synchronize: true,          
  logging: false,
  entities: [Person, Patient, Doctor, MedicalRecord, Examination, BloodTest, MRI, Result],
});
