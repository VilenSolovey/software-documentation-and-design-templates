import "reflect-metadata";
import { appDataSource } from "../data-source";
import { ExaminationRepository } from "../dal/repositories/ExaminationRepository";
import { loadMedicalExportConfig } from "../medical-export/config/loadMedicalExportConfig";
import { MedicalDbReader } from "../medical-export/io/MedicalDbReader";
import { MedicalExportService } from "../medical-export/services/MedicalExportService";

export async function runMedicalExport(configPathArg?: string): Promise<void> {
  const config = loadMedicalExportConfig(configPathArg);
  await appDataSource.initialize();

  try {
    const reader = new MedicalDbReader(new ExaminationRepository());
    const service = new MedicalExportService(reader);

    console.log(`Running medical export with "${config.output.strategy}" strategy`);
    const processedCount = await service.export(config);
    console.log(`Exported ${processedCount} records from medical.db`);
  } finally {
    if (appDataSource.isInitialized) {
      await appDataSource.destroy();
    }
  }
}

if (require.main === module) {
  runMedicalExport(process.argv[2]).catch((error) => {
    console.error("Medical export failed:", error);
    process.exit(1);
  });
}
