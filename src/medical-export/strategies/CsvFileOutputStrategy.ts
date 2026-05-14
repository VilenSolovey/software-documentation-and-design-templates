import * as fs from "fs";
import * as path from "path";
import { formatMedicalExportRow } from "../formatters/medicalCsv";
import { FileOutputConfig, MedicalExportRow } from "../types";
import { IOutputStrategy } from "./IOutputStrategy";

export class CsvFileOutputStrategy implements IOutputStrategy {
  constructor(private readonly config: FileOutputConfig) {}

  async open(): Promise<void> {
    await fs.promises.mkdir(path.dirname(this.config.outputFilePath), { recursive: true });
    await fs.promises.writeFile(this.config.outputFilePath, "", "utf-8");
  }

  async writeHeader(headerLine: string): Promise<void> {
    await fs.promises.appendFile(this.config.outputFilePath, `${headerLine}\n`, "utf-8");
  }

  async writeRow(row: MedicalExportRow): Promise<void> {
    await fs.promises.appendFile(this.config.outputFilePath, `${formatMedicalExportRow(row)}\n`, "utf-8");
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }
}
