import { PayrollExportConfig } from "../types";
import { ConsoleOutputStrategy } from "../strategies/ConsoleOutputStrategy";
import { IOutputStrategy } from "../strategies/IOutputStrategy";
import { KafkaOutputStrategy } from "../strategies/KafkaOutputStrategy";
import { RedisOutputStrategy } from "../strategies/RedisOutputStrategy";

export function createOutputStrategy(config: PayrollExportConfig["output"]): IOutputStrategy {
  switch (config.strategy) {
    case "console":
      return new ConsoleOutputStrategy();
    case "kafka":
      if (!config.kafka) {
        throw new Error('Kafka strategy requires the "output.kafka" section in config.');
      }
      return new KafkaOutputStrategy(config.kafka);
    case "redis":
      if (!config.redis) {
        throw new Error('Redis strategy requires the "output.redis" section in config.');
      }
      return new RedisOutputStrategy(config.redis);
    default:
      throw new Error(`Unsupported output strategy: ${String(config.strategy)}`);
  }
}
