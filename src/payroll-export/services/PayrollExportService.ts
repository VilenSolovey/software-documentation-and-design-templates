import * as fs from "fs";
import { PayrollExportConfig } from "../types";
import { createOutputStrategy } from "../factories/createOutputStrategy";
import { formatPayrollRow } from "../formatters/formatPayrollRow";
import { PayrollCsvReader } from "../io/PayrollCsvReader";
import { ProcessedFileWriter } from "../io/ProcessedFileWriter";

export class PayrollExportService {
  constructor(
    private readonly reader: PayrollCsvReader,
    private readonly fileWriter: ProcessedFileWriter,
  ) {}

  async export(config: PayrollExportConfig): Promise<number> {
    if (!fs.existsSync(config.dataset.localFilePath)) {
      throw new Error(
        `Dataset file not found: ${config.dataset.localFilePath}. Run "npm run payroll:download -- <config>" first.`,
      );
    }

    const rows = await this.reader.read(config.dataset.localFilePath);
    const limitedRows =
      typeof config.processing.maxRows === "number" ? rows.slice(0, config.processing.maxRows) : rows;
    const lines = limitedRows.map(formatPayrollRow);
    await this.fileWriter.writeLines(config.processing.outputFilePath, lines);

    const outputStrategy = createOutputStrategy(config.output);
    await outputStrategy.open();

    try {
      for (const line of lines) {
        await outputStrategy.write(line);
      }
    } finally {
      await outputStrategy.close();
    }

    return lines.length;
  }
}
