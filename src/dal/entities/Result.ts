import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { MedicalRecord } from "./MedicalRecord";

@Entity("results")
export class Result {
  @PrimaryColumn()
  id!: string;

  @Column()
  type!: string;

  @Column()
  filePath!: string;

  @Column({ type: "datetime" })
  createdAt!: Date;

  @ManyToOne(() => MedicalRecord, (mr) => mr.results, { nullable: true, eager: false })
  medicalRecord!: MedicalRecord;
}
