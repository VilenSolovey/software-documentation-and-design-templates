import "reflect-metadata";
import { container } from "tsyringe";
import { TOKENS } from "./tokens";

import { CsvReader } from "./dal/repositories/CsvReader";
import { PatientRepository } from "./dal/repositories/PatientRepository";
import { DoctorRepository } from "./dal/repositories/DoctorRepository";
import { MedicalRecordRepository } from "./dal/repositories/MedicalRecordRepository";
import { ExaminationRepository } from "./dal/repositories/ExaminationRepository";
import { ResultRepository } from "./dal/repositories/ResultRepository";
import { DataImportService } from "./bll/services/DataImportService";
import { ExaminationService } from "./bll/services/ExaminationService";
import { ReferenceDataService } from "./bll/services/ReferenceDataService";
import { ExaminationController } from "./presentation/controllers/ExaminationController";

container.register(TOKENS.ICsvReader, { useClass: CsvReader });
container.register(TOKENS.IPatientRepository, { useClass: PatientRepository });
container.register(TOKENS.IDoctorRepository, { useClass: DoctorRepository });
container.register(TOKENS.IMedicalRecordRepository, { useClass: MedicalRecordRepository });
container.register(TOKENS.IExaminationRepository, { useClass: ExaminationRepository });
container.register(TOKENS.IResultRepository, { useClass: ResultRepository });
container.register(TOKENS.IDataImportService, { useClass: DataImportService });
container.register(TOKENS.IExaminationService, { useClass: ExaminationService });
container.register(TOKENS.IReferenceDataService, { useClass: ReferenceDataService });
container.register(TOKENS.IExaminationWebController, { useClass: ExaminationController });

export { container };
