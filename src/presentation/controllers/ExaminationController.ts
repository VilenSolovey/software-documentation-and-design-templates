import { IncomingMessage, ServerResponse } from "http";
import { inject, injectable } from "tsyringe";
import { ValidationError } from "../../bll/errors/ValidationError";
import {
  ExaminationInput,
  IExaminationService,
} from "../../bll/interfaces/IExaminationService";
import { IReferenceDataService } from "../../bll/interfaces/IReferenceDataService";
import { TOKENS } from "../../tokens";
import {
  renderExaminationDetailsPage,
  renderExaminationFormPage,
  renderExaminationListPage,
  renderNotFoundPage,
} from "../views/examinations";

@injectable()
export class ExaminationController {
  constructor(
    @inject(TOKENS.IExaminationService)
    private readonly examinationService: IExaminationService,

    @inject(TOKENS.IReferenceDataService)
    private readonly referenceDataService: IReferenceDataService,
  ) {}

  async list(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const examinations = await this.examinationService.listExaminations();
    this.sendHtml(
      response,
      renderExaminationListPage({
        examinations,
        message: requestUrl.searchParams.get("message"),
      }),
    );
  }

  async showCreateForm(_request: IncomingMessage, response: ServerResponse): Promise<void> {
    const [patients, doctors] = await Promise.all([
      this.referenceDataService.getPatients(),
      this.referenceDataService.getDoctors(),
    ]);

    this.sendHtml(
      response,
      renderExaminationFormPage({
        mode: "create",
        patients,
        doctors,
        values: {
          patientId: patients[0]?.id ?? "",
          doctorId: doctors[0]?.id ?? "",
          date: new Date().toISOString().slice(0, 10),
          status: "scheduled",
          examinationType: "blood_test",
          resultCreatedAt: new Date().toISOString().slice(0, 16),
        },
      }),
    );
  }

  async create(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const formData = await this.readForm(request);

    try {
      const examinationId = await this.examinationService.createExamination(formData);
      this.redirect(
        response,
        `/examinations/${encodeURIComponent(examinationId)}?message=${encodeURIComponent("Запис успішно створено.")}`,
      );
    } catch (error) {
      await this.renderFormWithError(response, "create", formData, error);
    }
  }

  async showDetails(
    request: IncomingMessage,
    response: ServerResponse,
    examinationId: string,
  ): Promise<void> {
    const requestUrl = new URL(request.url ?? "/", "http://localhost");
    const examination = await this.examinationService.getExaminationById(examinationId);

    if (!examination) {
      this.sendHtml(response, renderNotFoundPage(), 404);
      return;
    }

    this.sendHtml(
      response,
      renderExaminationDetailsPage(examination, requestUrl.searchParams.get("message")),
    );
  }

  async showEditForm(
    _request: IncomingMessage,
    response: ServerResponse,
    examinationId: string,
  ): Promise<void> {
    const examination = await this.examinationService.getExaminationById(examinationId);

    if (!examination) {
      this.sendHtml(response, renderNotFoundPage(), 404);
      return;
    }

    const [patients, doctors] = await Promise.all([
      this.referenceDataService.getPatients(),
      this.referenceDataService.getDoctors(),
    ]);

    this.sendHtml(
      response,
      renderExaminationFormPage({
        mode: "edit",
        examinationId,
        patients,
        doctors,
        values: {
          patientId: examination.patientId,
          doctorId: examination.doctorId,
          date: examination.date,
          status: examination.status,
          examinationType: examination.examinationType,
          sampleType: examination.sampleType ?? "",
          scanRegion: examination.scanRegion ?? "",
          resultType: examination.resultType ?? "",
          resultFilePath: examination.resultFilePath ?? "",
          resultCreatedAt: examination.resultCreatedAt ?? "",
        },
      }),
    );
  }

  async update(
    request: IncomingMessage,
    response: ServerResponse,
    examinationId: string,
  ): Promise<void> {
    const formData = await this.readForm(request);

    try {
      await this.examinationService.updateExamination(examinationId, formData);
      this.redirect(
        response,
        `/examinations/${encodeURIComponent(examinationId)}?message=${encodeURIComponent("Зміни успішно збережено.")}`,
      );
    } catch (error) {
      await this.renderFormWithError(response, "edit", formData, error, examinationId);
    }
  }

  async delete(
    _request: IncomingMessage,
    response: ServerResponse,
    examinationId: string,
  ): Promise<void> {
    const deleted = await this.examinationService.deleteExamination(examinationId);

    if (!deleted) {
      this.sendHtml(response, renderNotFoundPage(), 404);
      return;
    }

    this.redirect(response, `/examinations?message=${encodeURIComponent("Запис успішно видалено.")}`);
  }

  private async renderFormWithError(
    response: ServerResponse,
    mode: "create" | "edit",
    values: ExaminationInput,
    error: unknown,
    examinationId?: string,
  ): Promise<void> {
    const [patients, doctors] = await Promise.all([
      this.referenceDataService.getPatients(),
      this.referenceDataService.getDoctors(),
    ]);

    const message =
      error instanceof ValidationError
        ? error.message
        : "Не вдалося зберегти запис через внутрішню помилку.";

    this.sendHtml(
      response,
      renderExaminationFormPage({
        mode,
        examinationId,
        patients,
        doctors,
        values,
        errorMessage: message,
      }),
      400,
    );
  }

  private async readForm(request: IncomingMessage): Promise<ExaminationInput> {
    const chunks: Buffer[] = [];

    for await (const chunk of request) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const body = Buffer.concat(chunks).toString("utf-8");
    const formData = new URLSearchParams(body);

    return {
      patientId: formData.get("patientId") ?? "",
      doctorId: formData.get("doctorId") ?? "",
      date: formData.get("date") ?? "",
      status: (formData.get("status") ?? "scheduled") as ExaminationInput["status"],
      examinationType: (formData.get("examinationType") ?? "blood_test") as ExaminationInput["examinationType"],
      sampleType: formData.get("sampleType") ?? "",
      scanRegion: formData.get("scanRegion") ?? "",
      resultType: formData.get("resultType") ?? "",
      resultFilePath: formData.get("resultFilePath") ?? "",
      resultCreatedAt: formData.get("resultCreatedAt") ?? "",
    };
  }

  private sendHtml(
    response: ServerResponse,
    html: string,
    statusCode = 200,
  ): void {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    response.end(html);
  }

  private redirect(response: ServerResponse, location: string): void {
    response.statusCode = 302;
    response.setHeader("Location", location);
    response.end();
  }
}
