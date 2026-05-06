import { loadPayrollExportConfig } from "../payroll-export/config/loadPayrollExportConfig";
import { PayrollCsvReader } from "../payroll-export/io/PayrollCsvReader";
import { ProcessedFileWriter } from "../payroll-export/io/ProcessedFileWriter";
import { PayrollExportService } from "../payroll-export/services/PayrollExportService";

async function main(): Promise<void> {
  const config = loadPayrollExportConfig(process.argv[2]);
  const service = new PayrollExportService(new PayrollCsvReader(), new ProcessedFileWriter());

  console.log(`Running payroll export with "${config.output.strategy}" strategy`);
  const processedCount = await service.export(config);
  console.log(`Processed ${processedCount} rows and saved them to ${config.processing.outputFilePath}`);
}

main().catch((error) => {
  if ((error as NodeJS.ErrnoException).code === "ECONNREFUSED") {
    const config = loadPayrollExportConfig(process.argv[2]);
    const target =
      config.output.strategy === "kafka"
        ? config.output.kafka?.brokers.join(", ")
        : config.output.redis?.url;

    console.error(
      `Cannot connect to ${config.output.strategy}. Start the service first or change the connection settings in the config. Target: ${target}`,
    );
  }

  console.error("Payroll export failed:", error);
  process.exit(1);
});
