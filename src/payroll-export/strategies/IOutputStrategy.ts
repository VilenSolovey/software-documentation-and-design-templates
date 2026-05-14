export interface IOutputStrategy {
  open(): Promise<void>;
  write(line: string): Promise<void>;
  close(): Promise<void>;
}
