import { MedicalExportRow } from "../types";

export interface IOutputStrategy {
  open(): Promise<void>;
  writeHeader(headerLine: string): Promise<void>;
  writeRow(row: MedicalExportRow): Promise<void>;
  close(): Promise<void>;
}
