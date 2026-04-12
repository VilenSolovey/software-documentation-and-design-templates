import {
  Entity,
  PrimaryColumn,
  Column,
  TableInheritance,
  ChildEntity,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { MedicalRecord } from "./MedicalRecord";
import { Examination } from "./Examination";

@Entity("persons")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export abstract class Person {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "date" })
  dateOfBirth!: Date;
}

@ChildEntity("patient")
export class Patient extends Person {
  @OneToOne(() => MedicalRecord, (mr) => mr.patient, {
    cascade: true,
    eager: false,
  })
  @JoinColumn()
  medicalRecord!: MedicalRecord;

  @OneToMany(() => Examination, (e) => e.patient)
  examinations!: Examination[];

  requestExamination(): void {
    console.log(`Patient ${this.name} requests an examination.`);
  }
}

@ChildEntity("doctor")
export class Doctor extends Person {
  @Column()
  specialization!: string;

  @OneToMany(() => Examination, (e) => e.doctor)
  examinations!: Examination[];

  createOrder(): void {
    console.log(`doctor ${this.name} creates an order.`);
  }

  reviewResults(): void {
    console.log(`doctor ${this.name} reviews results.`);
  }
}
