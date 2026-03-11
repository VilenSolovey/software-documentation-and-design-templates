import {
  Entity,
  PrimaryColumn,
  Column,
  TableInheritance,
  ChildEntity,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Patient, Doctor } from "./Person";
import { Result } from "./Result";

@Entity("examinations")
@TableInheritance({ column: { type: "varchar", name: "type" } })
export abstract class Examination {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "date" })
  date!: Date;

  @Column()
  status!: string;

  @ManyToOne(() => Patient, (p) => p.examinations, { eager: false })
  patient!: Patient;

  @ManyToOne(() => Doctor, (d) => d.examinations, { eager: false })
  doctor!: Doctor;

  @OneToOne(() => Result, { cascade: true, eager: true, nullable: true })
  @JoinColumn()
  result!: Result;

  abstract perform(): void;

  generateResult(): void {
    console.log(`generating result for examination ${this.id}`);
  }
}

@ChildEntity("blood_test")
export class BloodTest extends Examination {
  @Column({ nullable: true })
  sampleType!: string;

  perform(): void {
    console.log(`performing blood test [${this.sampleType}] for examination ${this.id}`);
  }
}

@ChildEntity("mri")
export class MRI extends Examination {
  @Column({ nullable: true })
  scanRegion!: string;

  perform(): void {
    console.log(`performing MRI scan [${this.scanRegion}] for examination ${this.id}`);
  }
}
