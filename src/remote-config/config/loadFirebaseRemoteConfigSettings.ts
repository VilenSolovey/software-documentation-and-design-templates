import * as fs from "fs";
import * as path from "path";
import { FirebaseRemoteConfigSettings } from "../types";

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Configuration field "${fieldName}" must be a non-empty string.`);
  }

  return value;
}

export function loadFirebaseRemoteConfigSettings(configPathArg?: string): FirebaseRemoteConfigSettings {
  const configPath = path.resolve(process.cwd(), configPathArg ?? "remote-config/firebase.config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`Remote config settings file not found: ${configPath}`);
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;

  return {
    projectId: assertString(rawConfig.projectId, "projectId"),
    serviceAccountPath: path.resolve(
      process.cwd(),
      assertString(rawConfig.serviceAccountPath, "serviceAccountPath"),
    ),
    parameterKey: typeof rawConfig.parameterKey === "string" && rawConfig.parameterKey.trim().length > 0
      ? rawConfig.parameterKey
      : "export_mode",
  };
}
