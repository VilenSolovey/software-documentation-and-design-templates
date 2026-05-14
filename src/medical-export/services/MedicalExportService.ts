import { MedicalExportConfig, MedicalExportRow } from "../types";
import { formatMedicalExportHeader } from "../formatters/medicalCsv";
import { createOutputStrategy } from "../factories/createOutputStrategy";
import { MedicalDbReader } from "../io/MedicalDbReader";

export class MedicalExportService {
  constructor(private readonly reader: MedicalDbReader) {}

  async export(config: MedicalExportConfig): Promise<number> {
    const rows = await this.reader.read();
    const limitedRows =
      typeof config.processing.maxRows === "number" ? rows.slice(0, config.processing.maxRows) : rows;

    return this.writeRows(limitedRows, config);
  }

  private async writeRows(rows: MedicalExportRow[], config: MedicalExportConfig): Promise<number> {
    const outputStrategy = createOutputStrategy(config.output);
    await outputStrategy.open();

    try {
      await outputStrategy.writeHeader(formatMedicalExportHeader());

      for (const row of rows) {
        await outputStrategy.writeRow(row);
      }
    } finally {
      await outputStrategy.close();
    }

    return rows.length;
  }
}
