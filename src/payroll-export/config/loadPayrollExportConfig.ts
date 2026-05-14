import * as fs from "fs";
import * as path from "path";
import { KafkaOutputConfig, OutputStrategyType, PayrollExportConfig, RedisOutputConfig } from "../types";

function isOutputStrategyType(value: string): value is OutputStrategyType {
  return value === "console" || value === "kafka" || value === "redis";
}

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Configuration field "${fieldName}" must be a non-empty string.`);
  }

  return value;
}

function parseKafkaConfig(rawKafka: unknown): KafkaOutputConfig {
  if (typeof rawKafka !== "object" || rawKafka === null) {
    throw new Error('Configuration section "output.kafka" is required for Kafka strategy.');
  }

  const kafka = rawKafka as Record<string, unknown>;
  const brokers = Array.isArray(kafka.brokers)
    ? kafka.brokers.filter((broker): broker is string => typeof broker === "string" && broker.trim().length > 0)
    : [];

  if (brokers.length === 0) {
    throw new Error('Configuration field "output.kafka.brokers" must contain at least one broker.');
  }

  return {
    clientId: assertString(kafka.clientId, "output.kafka.clientId"),
    brokers,
    topic: assertString(kafka.topic, "output.kafka.topic"),
  };
}

function parseRedisConfig(rawRedis: unknown): RedisOutputConfig {
  if (typeof rawRedis !== "object" || rawRedis === null) {
    throw new Error('Configuration section "output.redis" is required for Redis strategy.');
  }

  const redis = rawRedis as Record<string, unknown>;

  return {
    url: assertString(redis.url, "output.redis.url"),
    key: assertString(redis.key, "output.redis.key"),
  };
}

export function loadPayrollExportConfig(configPathArg?: string): PayrollExportConfig {
  const configPath = path.resolve(process.cwd(), configPathArg ?? "payroll-export/console.config.json");

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8")) as Record<string, unknown>;
  const rawDataset = rawConfig.dataset as Record<string, unknown> | undefined;
  const rawProcessing = rawConfig.processing as Record<string, unknown> | undefined;
  const rawOutput = rawConfig.output as Record<string, unknown> | undefined;

  if (!rawDataset || !rawProcessing || !rawOutput) {
    throw new Error('Configuration must contain "dataset", "processing", and "output" sections.');
  }

  const strategy = assertString(rawOutput.strategy, "output.strategy");
  if (!isOutputStrategyType(strategy)) {
    throw new Error('Configuration field "output.strategy" must be one of: console, kafka, redis.');
  }

  return {
    dataset: {
      url: assertString(rawDataset.url, "dataset.url"),
      localFilePath: path.resolve(process.cwd(), assertString(rawDataset.localFilePath, "dataset.localFilePath")),
      downloadTimeoutMs:
        typeof rawDataset.downloadTimeoutMs === "number" ? rawDataset.downloadTimeoutMs : 30_000,
    },
    processing: {
      outputFilePath: path.resolve(
        process.cwd(),
        assertString(rawProcessing.outputFilePath, "processing.outputFilePath"),
      ),
      maxRows: typeof rawProcessing.maxRows === "number" ? rawProcessing.maxRows : undefined,
    },
    output: {
      strategy,
      kafka: strategy === "kafka" ? parseKafkaConfig(rawOutput.kafka) : undefined,
      redis: strategy === "redis" ? parseRedisConfig(rawOutput.redis) : undefined,
    },
  };
}
