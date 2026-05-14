import * as fs from "fs";
import { parse } from "csv-parse";
import { PayrollCsvRow } from "../types";

export class PayrollCsvReader {
  async read(filePath: string): Promise<PayrollCsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: PayrollCsvRow[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on("readable", () => {
        let row: PayrollCsvRow | null;
        while ((row = parser.read() as PayrollCsvRow | null) !== null) {
          rows.push(row);
        }
      });

      parser.on("error", reject);
      parser.on("end", () => resolve(rows));

      fs.createReadStream(filePath).pipe(parser);
    });
  }
}
