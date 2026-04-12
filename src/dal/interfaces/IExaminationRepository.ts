import { Examination } from "../entities/Examination";

export interface IExaminationRepository {
  save(examination: Examination): Promise<Examination>;
  saveMany(examinations: Examination[]): Promise<Examination[]>;
  findById(id: string): Promise<Examination | null>;
  findAll(): Promise<Examination[]>;
}
