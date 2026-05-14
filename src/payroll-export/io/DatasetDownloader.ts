import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";

export class DatasetDownloader {
  async downloadToFile(url: string, destinationPath: string, timeoutMs = 30_000): Promise<void> {
    await fs.promises.mkdir(path.dirname(destinationPath), { recursive: true });
    await this.download(url, destinationPath, timeoutMs, 0);
  }

  private async download(
    url: string,
    destinationPath: string,
    timeoutMs: number,
    redirectCount: number,
  ): Promise<void> {
    if (redirectCount > 5) {
      throw new Error("Too many redirects while downloading the dataset.");
    }

    await new Promise<void>((resolve, reject) => {
      const requestUrl = new URL(url);
      const client = requestUrl.protocol === "https:" ? https : http;

      const request = client.get(requestUrl, (response) => {
        const statusCode = response.statusCode ?? 0;
        const location = response.headers.location;

        if (statusCode >= 300 && statusCode < 400 && location) {
          response.resume();
          const nextUrl = new URL(location, requestUrl).toString();
          this.download(nextUrl, destinationPath, timeoutMs, redirectCount + 1).then(resolve).catch(reject);
          return;
        }

        if (statusCode < 200 || statusCode >= 300) {
          response.resume();
          reject(new Error(`Dataset download failed with status ${statusCode}.`));
          return;
        }

        const writeStream = fs.createWriteStream(destinationPath);
        response.pipe(writeStream);

        writeStream.on("finish", () => {
          writeStream.close();
          resolve();
        });

        writeStream.on("error", (error) => {
          response.destroy();
          reject(error);
        });
      });

      request.setTimeout(timeoutMs, () => {
        request.destroy(new Error(`Dataset download timed out after ${timeoutMs} ms.`));
      });

      request.on("error", reject);
    });
  }
}
