import { MedicalExportConfig } from "../types";
import { CsvFileOutputStrategy } from "../strategies/CsvFileOutputStrategy";
import { IOutputStrategy } from "../strategies/IOutputStrategy";

export function createOutputStrategy(config: MedicalExportConfig["output"]): IOutputStrategy {
  switch (config.strategy) {
    case "file":
      return new CsvFileOutputStrategy(config.file);
    default:
      throw new Error(`Unsupported output strategy: ${String(config.strategy)}`);
  }
}
