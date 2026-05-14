import { IOutputStrategy } from "./IOutputStrategy";

export class ConsoleOutputStrategy implements IOutputStrategy {
  async open(): Promise<void> {
    return Promise.resolve();
  }

  async write(line: string): Promise<void> {
    console.log(line);
  }

  async close(): Promise<void> {
    return Promise.resolve();
  }
}
