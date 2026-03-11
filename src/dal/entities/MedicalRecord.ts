import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  OneToMany,
} from "typeorm";
import { Patient } from "./Person";
import { Result } from "./Result";

@Entity("medical_records")
export class MedicalRecord {
  @PrimaryColumn()
  recordId!: string;

  @OneToOne(() => Patient, (p) => p.medicalRecord, { eager: false })
  patient!: Patient;

  @OneToMany(() => Result, (r) => r.medicalRecord, {
    cascade: true,
    eager: false,
  })
  results!: Result[];

  addResult(result: Result): void {
    if (!this.results) this.results = [];
    this.results.push(result);
  }

  getResults(): Result[] {
    return this.results ?? [];
  }
}
