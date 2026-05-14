import * as fs from "fs";
import * as path from "path";
import { FileOutputConfig, MedicalExportConfig, OutputStrategyType } from "../types";

function isOutputStrategyType(value: string): value is OutputStrategyType {
  return value === "file";
}

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Configuration field "${fieldName}" must be a non-empty string.`);
  }

  return value;
}

function parseFileConfig(rawFile: unknown): FileOutputConfig {
  if (typeof rawFile !== "object" || rawFile === null) {
    throw new Error('Configuration section "output.file" is required for file strategy.');
  }

  const file = rawFile as Record<string, unknown>;
  return {
    outputFilePath: path.resolve(process.cwd(), assertString(file.outputFilePath, "output.file.outputFilePath")),
  };
}

export function loadMedicalExportConfig(configPathArg?: string): MedicalExportConfig {
  const configPath = path.resolve(process.cwd(), configPathArg ?? "medical-export/file.config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;
  const rawProcessing = rawConfig.processing as Record<string, unknown> | undefined;
  const rawOutput = rawConfig.output as Record<string, unknown> | undefined;

  if (!rawProcessing || !rawOutput) {
    throw new Error('Configuration must contain "processing" and "output" sections.');
  }

  const strategy = assertString(rawOutput.strategy, "output.strategy");
  if (!isOutputStrategyType(strategy)) {
    throw new Error('Configuration field "output.strategy" must be: file.');
  }

  return {
    processing: {
      maxRows: typeof rawProcessing.maxRows === "number" ? rawProcessing.maxRows : undefined,
    },
    output: {
      strategy,
      file: parseFileConfig(rawOutput.file),
    },
  };
}
