import * as fs from "fs";
import * as path from "path";

export class ProcessedFileWriter {
  async writeLines(filePath: string, lines: string[]): Promise<void> {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    const content = lines.length > 0 ? `${lines.join("\n")}\n` : "";
    await fs.promises.writeFile(filePath, content, "utf-8");
  }
}
