import { Examination } from "../../dal/entities/Examination";

export interface IExaminationController {
  getAll(): Promise<Examination[]>;
  getById(id: string): Promise<Examination | null>;
}
