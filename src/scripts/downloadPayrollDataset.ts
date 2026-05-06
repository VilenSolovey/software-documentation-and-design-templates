import { loadPayrollExportConfig } from "../payroll-export/config/loadPayrollExportConfig";
import { DatasetDownloader } from "../payroll-export/io/DatasetDownloader";

async function main(): Promise<void> {
  const config = loadPayrollExportConfig(process.argv[2]);
  const downloader = new DatasetDownloader();

  console.log(`Downloading dataset from ${config.dataset.url}`);
  await downloader.downloadToFile(
    config.dataset.url,
    config.dataset.localFilePath,
    config.dataset.downloadTimeoutMs,
  );
  console.log(`Dataset saved to ${config.dataset.localFilePath}`);
}

main().catch((error) => {
  console.error("Payroll dataset download failed:", error);
  process.exit(1);
});
