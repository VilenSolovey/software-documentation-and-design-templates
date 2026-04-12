import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { Examination } from "../entities/Examination";
import { IExaminationRepository } from "../interfaces/IExaminationRepository";
import { appDataSource } from "../../data-source";

@injectable()
export class ExaminationRepository implements IExaminationRepository {
  private readonly ds: DataSource;

  constructor() {
    this.ds = appDataSource;
  }

  async save(examination: Examination): Promise<Examination> {
    return this.ds.getRepository(Examination).save(examination);
  }

  async saveMany(examinations: Examination[]): Promise<Examination[]> {
    if (examinations.length === 0) return [];
    return this.ds.getRepository(Examination).save(examinations);
  }

  async findById(id: string): Promise<Examination | null> {
    return this.ds.getRepository(Examination).findOneBy({ id });
  }

  async findAll(): Promise<Examination[]> {
    return this.ds.getRepository(Examination).find();
  }
}
