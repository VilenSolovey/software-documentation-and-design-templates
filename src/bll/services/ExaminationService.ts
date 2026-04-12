import { randomUUID } from "crypto";
import { inject, injectable } from "tsyringe";
import { BloodTest, Examination, MRI } from "../../dal/entities/Examination";
import { Doctor, Patient } from "../../dal/entities/Person";
import { Result } from "../../dal/entities/Result";
import { IDoctorRepository } from "../../dal/interfaces/IDoctorRepository";
import { IExaminationRepository } from "../../dal/interfaces/IExaminationRepository";
import { IPatientRepository } from "../../dal/interfaces/IPatientRepository";
import { TOKENS } from "../../tokens";
import { ValidationError } from "../errors/ValidationError";
import {
  ExaminationDetails,
  ExaminationInput,
  ExaminationSummary,
  ExaminationType,
  IExaminationService,
} from "../interfaces/IExaminationService";

const ALLOWED_STATUSES = new Set([
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
]);

@injectable()
export class ExaminationService implements IExaminationService {
  constructor(
    @inject(TOKENS.IExaminationRepository)
    private readonly examinationRepository: IExaminationRepository,

    @inject(TOKENS.IPatientRepository)
    private readonly patientRepository: IPatientRepository,

    @inject(TOKENS.IDoctorRepository)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async listExaminations(): Promise<ExaminationSummary[]> {
    const examinations = await this.examinationRepository.findAll();
    return examinations.map((examination) => this.toSummary(examination));
  }

  async getExaminationById(id: string): Promise<ExaminationDetails | null> {
    const examination = await this.examinationRepository.findById(id);
    return examination ? this.toDetails(examination) : null;
  }

  async createExamination(input: ExaminationInput): Promise<string> {
    const examination = await this.buildExaminationEntity(input);
    const savedExamination = await this.examinationRepository.save(examination);
    return savedExamination.id;
  }

  async updateExamination(id: string, input: ExaminationInput): Promise<void> {
    const existingExamination = await this.examinationRepository.findById(id);

    if (!existingExamination) {
      throw new ValidationError("обстеження для редагування не знайдено.");
    }

    const examinationTypeChanged =
      this.getExaminationType(existingExamination) !== input.examinationType;
    const examination = await this.buildExaminationEntity(
      input,
      examinationTypeChanged ? undefined : existingExamination,
    );
    examination.id = existingExamination.id;

    if (examinationTypeChanged) {
      await this.examinationRepository.delete(id);
    }

    await this.examinationRepository.save(examination);
  }

  async deleteExamination(id: string): Promise<boolean> {
    return this.examinationRepository.delete(id);
  }

  async countExaminations(): Promise<number> {
    return this.examinationRepository.count();
  }

  private async buildExaminationEntity(
    input: ExaminationInput,
    existingExamination?: Examination,
  ): Promise<Examination> {
    const normalizedInput = this.normalizeInput(input);
    const patient = await this.patientRepository.findById(normalizedInput.patientId);
    const doctor = await this.doctorRepository.findById(normalizedInput.doctorId);

    if (!patient) {
      throw new ValidationError("Вибраного пацієнта не знайдено.");
    }

    if (!doctor) {
      throw new ValidationError("Вибраного лікаря не знайдено.");
    }

    if (!patient.medicalRecord) {
      throw new ValidationError("У вибраного пацієнта відсутня медична картка.");
    }

    const examination =
      normalizedInput.examinationType === "blood_test"
        ? new BloodTest()
        : new MRI();

    examination.id = existingExamination?.id ?? randomUUID();
    examination.date = new Date(normalizedInput.date);
    examination.status = normalizedInput.status;
    examination.patient = patient;
    examination.doctor = doctor;
    examination.result = this.buildResult(
      normalizedInput,
      patient,
      existingExamination?.result ?? null,
    );

    if (examination instanceof BloodTest) {
      examination.sampleType = normalizedInput.sampleType ?? "";
    }

    if (examination instanceof MRI) {
      examination.scanRegion = normalizedInput.scanRegion ?? "";
    }

    return examination;
  }

  private buildResult(
    input: NormalizedExaminationInput,
    patient: Patient,
    existingResult: Result | null,
  ): Result {
    const result = existingResult ?? new Result();
    result.id = existingResult?.id ?? randomUUID();
    result.type = input.resultType;
    result.filePath = input.resultFilePath;
    result.createdAt = new Date(input.resultCreatedAt);
    result.medicalRecord = patient.medicalRecord;
    return result;
  }

  private normalizeInput(input: ExaminationInput): NormalizedExaminationInput {
    const patientId = input.patientId.trim();
    const doctorId = input.doctorId.trim();
    const date = input.date.trim();
    const status = input.status;
    const examinationType = input.examinationType;
    const sampleType = input.sampleType?.trim() ?? "";
    const scanRegion = input.scanRegion?.trim() ?? "";
    const resultType = input.resultType?.trim() || this.defaultResultType(examinationType);
    const resultFilePath =
      input.resultFilePath?.trim() || `results/${randomUUID()}.pdf`;
    const resultCreatedAt =
      input.resultCreatedAt?.trim() || new Date().toISOString().slice(0, 16);

    if (!patientId) {
      throw new ValidationError("Потрібно вибрати пацієнта.");
    }

    if (!doctorId) {
      throw new ValidationError("Потрібно вибрати лікаря.");
    }

    if (!date || Number.isNaN(new Date(date).getTime())) {
      throw new ValidationError("Потрібно вказати коректну дату обстеження.");
    }

    if (!ALLOWED_STATUSES.has(status)) {
      throw new ValidationError("Статус обстеження має некоректне значення.");
    }

    if (examinationType !== "blood_test" && examinationType !== "mri") {
      throw new ValidationError("Тип обстеження має некоректне значення.");
    }

    if (examinationType === "blood_test" && !sampleType) {
      throw new ValidationError("Для аналізу крові потрібно вказати тип зразка.");
    }

    if (examinationType === "mri" && !scanRegion) {
      throw new ValidationError("Для МРТ потрібно вказати зону сканування.");
    }

    if (!resultType) {
      throw new ValidationError("Потрібно вказати тип результату.");
    }

    if (!resultFilePath) {
      throw new ValidationError("Потрібно вказати шлях до результату.");
    }

    if (Number.isNaN(new Date(resultCreatedAt).getTime())) {
      throw new ValidationError("Дата створення результату має некоректний формат.");
    }

    return {
      patientId,
      doctorId,
      date,
      status,
      examinationType,
      sampleType: sampleType || null,
      scanRegion: scanRegion || null,
      resultType,
      resultFilePath,
      resultCreatedAt,
    };
  }

  private defaultResultType(examinationType: ExaminationType): string {
    return examinationType === "blood_test" ? "blood_analysis" : "mri_scan";
  }

  private toSummary(examination: Examination): ExaminationSummary {
    return {
      id: examination.id,
      patientName: examination.patient?.name ?? "Невідомий пацієнт",
      doctorName: examination.doctor?.name ?? "Невідомий лікар",
      examinationType: this.getExaminationType(examination),
      date: this.formatDate(examination.date),
      status: examination.status as ExaminationSummary["status"],
      resultType: examination.result?.type ?? null,
    };
  }

  private toDetails(examination: Examination): ExaminationDetails {
    return {
      ...this.toSummary(examination),
      patientId: examination.patient?.id ?? "",
      patientDateOfBirth: this.formatDate(examination.patient?.dateOfBirth),
      doctorId: examination.doctor?.id ?? "",
      doctorSpecialization: (examination.doctor as Doctor | undefined)?.specialization ?? "",
      sampleType: examination instanceof BloodTest ? examination.sampleType ?? null : null,
      scanRegion: examination instanceof MRI ? examination.scanRegion ?? null : null,
      resultId: examination.result?.id ?? null,
      resultFilePath: examination.result?.filePath ?? null,
      resultCreatedAt: this.formatDateTime(examination.result?.createdAt),
      medicalRecordId: examination.result?.medicalRecord?.recordId ?? null,
    };
  }

  private getExaminationType(examination: Examination): ExaminationType {
    if (examination instanceof BloodTest) {
      return "blood_test";
    }

    return "mri";
  }

  private formatDate(value?: Date | string | null): string {
    const date = this.toDate(value);

    if (!date) {
      return "";
    }

    return date.toISOString().slice(0, 10);
  }

  private formatDateTime(value?: Date | string | null): string {
    const date = this.toDate(value);

    if (!date) {
      return "";
    }

    return date.toISOString().slice(0, 16);
  }

  private toDate(value?: Date | string | null): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }
}

interface NormalizedExaminationInput {
  patientId: string;
  doctorId: string;
  date: string;
  status: ExaminationInput["status"];
  examinationType: ExaminationType;
  sampleType: string | null;
  scanRegion: string | null;
  resultType: string;
  resultFilePath: string;
  resultCreatedAt: string;
}
