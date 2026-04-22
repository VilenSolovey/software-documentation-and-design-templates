import { inject, injectable } from "tsyringe";
import { IDoctorRepository } from "../../dal/interfaces/IDoctorRepository";
import { IPatientRepository } from "../../dal/interfaces/IPatientRepository";
import { TOKENS } from "../../tokens";
import {
  DoctorOption,
  IReferenceDataService,
  PatientOption,
} from "../interfaces/IReferenceDataService";

@injectable()
export class ReferenceDataService implements IReferenceDataService {
  constructor(
    @inject(TOKENS.IPatientRepository)
    private readonly patientRepository: IPatientRepository,

    @inject(TOKENS.IDoctorRepository)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async getPatients(): Promise<PatientOption[]> {
    const patients = await this.patientRepository.findAll();
    return patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      medicalRecordId: patient.medicalRecord?.recordId ?? null,
    }));
  }

  async getDoctors(): Promise<DoctorOption[]> {
    const doctors = await this.doctorRepository.findAll();
    return doctors.map((doctor) => ({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
    }));
  }
}
