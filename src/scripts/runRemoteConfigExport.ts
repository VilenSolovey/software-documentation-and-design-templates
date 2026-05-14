import { loadFirebaseRemoteConfigSettings } from "../remote-config/config/loadFirebaseRemoteConfigSettings";
import { FirebaseRemoteConfigService } from "../remote-config/services/FirebaseRemoteConfigService";
import { runMedicalExport } from "./runMedicalExport";
import { runPayrollExport } from "./runPayrollExport";

type ExportMode = "console" | "kafka" | "redis" | "medical_db_csv";

function assertExportMode(value: string): ExportMode {
  if (value === "console" || value === "kafka" || value === "redis" || value === "medical_db_csv") {
    return value;
  }

  throw new Error(`Unsupported remote export_mode: ${value}`);
}

async function main(): Promise<void> {
  const settings = loadFirebaseRemoteConfigSettings(process.argv[2]);
  const remoteConfigService = new FirebaseRemoteConfigService(settings);
  const exportMode = assertExportMode(await remoteConfigService.getStringParameter());

  console.log(`Remote Config export_mode="${exportMode}"`);

  switch (exportMode) {
    case "console":
      await runPayrollExport("payroll-export/console.config.json");
      return;
    case "kafka":
      await runPayrollExport("payroll-export/kafka.config.json");
      return;
    case "redis":
      await runPayrollExport("payroll-export/redis.config.json");
      return;
    case "medical_db_csv":
      await runMedicalExport("medical-export/file.config.json");
      return;
  }
}

main().catch((error) => {
  console.error("Remote config export failed:", error);
  process.exit(1);
});
