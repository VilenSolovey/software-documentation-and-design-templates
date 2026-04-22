import "reflect-metadata";
import * as path from "path";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { appDataSource } from "./data-source";
import "./container";
import { container } from "tsyringe";
import { TOKENS } from "./tokens";
import { IDataImportService } from "./bll/interfaces/IDataImportService";
import { IExaminationService } from "./bll/interfaces/IExaminationService";
import { ExaminationController } from "./presentation/controllers/ExaminationController";

const DEFAULT_PORT = 3000;
const DEFAULT_HOST = "127.0.0.1";

function redirect(response: ServerResponse, location: string): void {
  response.statusCode = 302;
  response.setHeader("location", location);
  response.end();
}

function notFound(response: ServerResponse): void {
  response.statusCode = 404;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("сторінку не знайдено.");
}

function methodNotAllowed(response: ServerResponse): void {
  response.statusCode = 405;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end("метод не підтримується.");
}

async function ensureSeedData(): Promise<void> {
  const examinationService = container.resolve<IExaminationService>(TOKENS.IExaminationService);
  const examinationCount = await examinationService.countExaminations();

  if (examinationCount > 0) {
    return;
  }

  const csvPath = path.resolve(__dirname, "../data/medical_data.csv");
  console.log(`database is empty, importing seed data from ${csvPath}`);
  const importService = container.resolve<IDataImportService>(TOKENS.IDataImportService);
  const count = await importService.importFromCsv(csvPath);
  console.log(`seeded ${count} examinations.`);
}

async function routeRequest(
  request: IncomingMessage,
  response: ServerResponse,
  controller: ExaminationController,
): Promise<void> {
  const requestUrl = new URL(request.url ?? "/", "http://localhost");
  const pathname = requestUrl.pathname;
  const method = request.method ?? "GET";
  const examinationMatch = pathname.match(/^\/examinations\/([^/]+)$/);
  const examinationEditMatch = pathname.match(/^\/examinations\/([^/]+)\/edit$/);
  const examinationUpdateMatch = pathname.match(/^\/examinations\/([^/]+)\/update$/);
  const examinationDeleteMatch = pathname.match(/^\/examinations\/([^/]+)\/delete$/);

  if (pathname === "/") {
    redirect(response, "/examinations");
    return;
  }

  if (pathname === "/examinations" && method === "GET") {
    await controller.list(request, response);
    return;
  }

  if (pathname === "/examinations/new" && method === "GET") {
    await controller.showCreateForm(request, response);
    return;
  }

  if (pathname === "/examinations" && method === "POST") {
    await controller.create(request, response);
    return;
  }

  if (examinationEditMatch && method === "GET") {
    await controller.showEditForm(request, response, decodeURIComponent(examinationEditMatch[1]));
    return;
  }

  if (examinationUpdateMatch && method === "POST") {
    await controller.update(request, response, decodeURIComponent(examinationUpdateMatch[1]));
    return;
  }

  if (examinationDeleteMatch && method === "POST") {
    await controller.delete(request, response, decodeURIComponent(examinationDeleteMatch[1]));
    return;
  }

  if (examinationMatch && method === "GET") {
    await controller.showDetails(request, response, decodeURIComponent(examinationMatch[1]));
    return;
  }

  if (
    pathname === "/examinations" ||
    pathname === "/examinations/new" ||
    examinationMatch ||
    examinationEditMatch ||
    examinationUpdateMatch ||
    examinationDeleteMatch
  ) {
    methodNotAllowed(response);
    return;
  }

  notFound(response);
}

async function bootstrap(): Promise<void> {
  await appDataSource.initialize();
  console.log("database ready.");
  await ensureSeedData();

  const controller = container.resolve<ExaminationController>(TOKENS.IExaminationWebController);
  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  const host = process.env.HOST ?? DEFAULT_HOST;
  const server = createServer((request, response) => {
    routeRequest(request, response, controller).catch((error) => {
      console.error("request error:", error);
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("внутрішня помилка сервера.");
    });
  });

  server.listen(port, host, () => {
    console.log(`medical mvc app is running at http://${host}:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("fatal error:", err);
  process.exit(1);
});
