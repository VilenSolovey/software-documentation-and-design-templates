import { Result } from "../entities/Result";

export interface IResultRepository {
  save(result: Result): Promise<Result>;
  saveMany(results: Result[]): Promise<Result[]>;
  findById(id: string): Promise<Result | null>;
  findAll(): Promise<Result[]>;
}
