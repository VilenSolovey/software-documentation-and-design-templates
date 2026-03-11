import "reflect-metadata";
import * as path from "path";
import { appDataSource } from "./data-source";
import "./container"; 
import { container } from "tsyringe";
import { TOKENS } from "./tokens";
import { IDataImportService } from "./bll/interfaces/IDataImportService";

async function bootstrap(): Promise<void> {
  await appDataSource.initialize();
  console.log("database ready.");

  const csvArg  = process.argv[2];
  const csvPath = csvArg
    ? path.resolve(csvArg)
    : path.resolve(__dirname, "../data/medical_data.csv");

  console.log(`CSV source: ${csvPath}`);
  const importService = container.resolve<IDataImportService>(TOKENS.IDataImportService);

  const count = await importService.importFromCsv(csvPath);
  console.log(`successfully imported ${count} records into the database.`);

  await appDataSource.destroy();
  console.log("done");
}

bootstrap().catch((err) => {
  console.error("fatal error:", err);
  process.exit(1);
});
