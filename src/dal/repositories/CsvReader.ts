import { injectable } from "tsyringe";
import { parse } from "csv-parse";
import * as fs from "fs";
import { ICsvReader, MedicalCsvRow } from "../interfaces/ICsvReader";

@injectable()
export class CsvReader implements ICsvReader {
  async readFile(filePath: string): Promise<MedicalCsvRow[]> {
    return new Promise((resolve, reject) => {
      const rows: MedicalCsvRow[] = [];

      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on("readable", () => {
        let record: MedicalCsvRow;
        while ((record = parser.read() as MedicalCsvRow) !== null) {
          rows.push(record);
        }
      });

      parser.on("error", reject);
      parser.on("end", () => resolve(rows));

      fs.createReadStream(filePath).pipe(parser);
    });
  }
}
