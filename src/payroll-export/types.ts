export type OutputStrategyType = "console" | "kafka" | "redis";

export interface KafkaOutputConfig {
  clientId: string;
  brokers: string[];
  topic: string;
}

export interface RedisOutputConfig {
  url: string;
  key: string;
}

export interface PayrollExportConfig {
  dataset: {
    url: string;
    localFilePath: string;
    downloadTimeoutMs?: number;
  };
  processing: {
    outputFilePath: string;
    maxRows?: number;
  };
  output: {
    strategy: OutputStrategyType;
    kafka?: KafkaOutputConfig;
    redis?: RedisOutputConfig;
  };
}

export type PayrollCsvRow = Record<string, string>;
