import { Kafka, Producer, logLevel } from "kafkajs";
import { KafkaOutputConfig } from "../types";
import { IOutputStrategy } from "./IOutputStrategy";

export class KafkaOutputStrategy implements IOutputStrategy {
  private readonly producer: Producer;

  constructor(private readonly config: KafkaOutputConfig) {
    const kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      logLevel: logLevel.NOTHING,
    });

    this.producer = kafka.producer();
  }

  async open(): Promise<void> {
    await this.producer.connect();
  }

  async write(line: string): Promise<void> {
    await this.producer.send({
      topic: this.config.topic,
      messages: [{ value: line }],
    });
  }

  async close(): Promise<void> {
    await this.producer.disconnect();
  }
}
