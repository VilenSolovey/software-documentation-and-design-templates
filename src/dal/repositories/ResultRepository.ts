import { injectable } from "tsyringe";
import { DataSource } from "typeorm";
import { Result } from "../entities/Result";
import { IResultRepository } from "../interfaces/IResultRepository";
import { appDataSource } from "../../data-source";

@injectable()
export class ResultRepository implements IResultRepository {
  private readonly ds: DataSource;

  constructor() {
    this.ds = appDataSource;
  }

  async save(result: Result): Promise<Result> {
    return this.ds.getRepository(Result).save(result);
  }

  async saveMany(results: Result[]): Promise<Result[]> {
    if (results.length === 0) return [];
    return this.ds.getRepository(Result).save(results);
  }

  async findById(id: string): Promise<Result | null> {
    return this.ds.getRepository(Result).findOneBy({ id });
  }

  async findAll(): Promise<Result[]> {
    return this.ds.getRepository(Result).find();
  }
}
