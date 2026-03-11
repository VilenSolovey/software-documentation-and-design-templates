import { inject, injectable } from "tsyringe";
import { IDataImportService } from "../interfaces/IDataImportService";
import { ICsvReader, MedicalCsvRow } from "../../dal/interfaces/ICsvReader";
import { IPatientRepository } from "../../dal/interfaces/IPatientRepository";
import { IDoctorRepository } from "../../dal/interfaces/IDoctorRepository";
import { IMedicalRecordRepository } from "../../dal/interfaces/IMedicalRecordRepository";
import { IExaminationRepository } from "../../dal/interfaces/IExaminationRepository";
import { IResultRepository } from "../../dal/interfaces/IResultRepository";
import { TOKENS } from "../../tokens";

import { Patient, Doctor } from "../../dal/entities/Person";
import { MedicalRecord } from "../../dal/entities/MedicalRecord";
import { BloodTest, MRI } from "../../dal/entities/Examination";
import { Result } from "../../dal/entities/Result";

@injectable()
export class DataImportService implements IDataImportService {
  constructor(
    @inject(TOKENS.ICsvReader)
    private readonly csvReader: ICsvReader,

    @inject(TOKENS.IPatientRepository)
    private readonly patientRepo: IPatientRepository,

    @inject(TOKENS.IDoctorRepository)
    private readonly doctorRepo: IDoctorRepository,

    @inject(TOKENS.IMedicalRecordRepository)
    private readonly medicalRecordRepo: IMedicalRecordRepository,

    @inject(TOKENS.IExaminationRepository)
    private readonly examinationRepo: IExaminationRepository,

    @inject(TOKENS.IResultRepository)
    private readonly resultRepo: IResultRepository,
  ) {}

  async importFromCsv(csvFilePath: string): Promise<number> {
    const rows = await this.csvReader.readFile(csvFilePath);
    console.log(`read ${rows.length} rows from CSV.`);

    const patientMap = new Map<string, Patient>();
    const recordMap = new Map<string, MedicalRecord>();

    for (const row of rows) {
      if (!patientMap.has(row.patientId)) {
        const patient = new Patient();
        patient.id = row.patientId;
        patient.name = row.patientName;
        patient.dateOfBirth = new Date(row.patientDob);

        const record = new MedicalRecord();
        record.recordId = row.recordId;
        record.results = [];

        patient.medicalRecord = record;

        patientMap.set(row.patientId, patient);
        recordMap.set(row.recordId, record);
      }
    }
    const patients = Array.from(patientMap.values());
    console.log(`upserting ${patients.length} unique patients…`);
    await this.patientRepo.saveMany(patients);


    const doctorMap = new Map<string, Doctor>();
    for (const row of rows) {
      if (!doctorMap.has(row.doctorId)) {
        const doctor = new Doctor();
        doctor.id = row.doctorId;
        doctor.name = row.doctorName;
        doctor.dateOfBirth = new Date(row.doctorDob);
        doctor.specialization = row.doctorSpecialization;
        doctorMap.set(row.doctorId, doctor);
      }
    }
    const doctors = Array.from(doctorMap.values());
    console.log(`upserting ${doctors.length} unique doctors…`);
    await this.doctorRepo.saveMany(doctors);

  
    const examinationSet = new Set<string>();
    const examinations: (BloodTest | MRI)[] = [];

    for (const row of rows) {
      if (examinationSet.has(row.examinationId)) continue;
      examinationSet.add(row.examinationId);

      const result = new Result();
      result.id = row.resultId;
      result.type = row.resultType;
      result.filePath = row.resultFilePath;
      result.createdAt = new Date(row.resultCreatedAt);


      const record = recordMap.get(row.recordId);
      if (record) {
        result.medicalRecord = record;
      }


      const patient = patientMap.get(row.patientId)!;
      const doctor = doctorMap.get(row.doctorId)!;

      if (row.examinationType === "blood_test") {
        const exam = new BloodTest();
        exam.id = row.examinationId;
        exam.date = new Date(row.examinationDate);
        exam.status = row.examinationStatus;
        exam.sampleType = row.sampleType;
        exam.patient = patient;
        exam.doctor = doctor;
        exam.result = result;
        examinations.push(exam);
      } else {
        const exam = new MRI();
        exam.id = row.examinationId;
        exam.date = new Date(row.examinationDate);
        exam.status = row.examinationStatus;
        exam.scanRegion = row.scanRegion;
        exam.patient = patient;
        exam.doctor = doctor;
        exam.result = result;
        examinations.push(exam);
      }
    }


    const BATCH_SIZE = 100;
    let saved = 0;
    for (let i = 0; i < examinations.length; i += BATCH_SIZE) {
      const batch = examinations.slice(i, i + BATCH_SIZE);
      await this.examinationRepo.saveMany(batch);
      saved += batch.length;
      console.log(`saved ${saved}/${examinations.length} examinations…`);
    }

    console.log(`Finallyyy import complete. Total examinations saved: ${saved}.`);
    return saved;
  }
}
