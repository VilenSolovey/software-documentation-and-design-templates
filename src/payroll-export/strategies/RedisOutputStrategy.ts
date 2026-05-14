import { RedisClientType, createClient } from "redis";
import { RedisOutputConfig } from "../types";
import { IOutputStrategy } from "./IOutputStrategy";

export class RedisOutputStrategy implements IOutputStrategy {
  private readonly client: RedisClientType;

  constructor(private readonly config: RedisOutputConfig) {
    this.client = createClient({
      url: config.url,
    });
  }

  async open(): Promise<void> {
    await this.client.connect();
  }

  async write(line: string): Promise<void> {
    await this.client.rPush(this.config.key, line);
  }

  async close(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
