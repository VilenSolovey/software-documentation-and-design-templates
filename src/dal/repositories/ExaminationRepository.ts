import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { Examination } from "../entities/Examination";
import { Result } from "../entities/Result";
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
    return this.ds.getRepository(Examination).findOne({
      where: { id },
      relations: {
        patient: true,
        doctor: true,
        result: {
          medicalRecord: true,
        },
      },
    });
  }

  async findAll(): Promise<Examination[]> {
    return this.ds.getRepository(Examination).find({
      relations: {
        patient: true,
        doctor: true,
        result: {
          medicalRecord: true,
        },
      },
      order: {
        date: "DESC",
      },
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.ds.transaction(async (manager) => {
      const examination = await manager.getRepository(Examination).findOne({
        where: { id },
        relations: {
          result: true,
        },
      });

      if (!examination) {
        return false;
      }

      await manager.getRepository(Examination).delete({ id });

      if (examination.result?.id) {
        await manager.getRepository(Result).delete({ id: examination.result.id });
      }

      return true;
    });
  }

  async count(): Promise<number> {
    return this.ds.getRepository(Examination).count();
  }
}
