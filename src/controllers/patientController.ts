import { Request, Response } from "express";
import { AppDataSource } from "../services/db";
import { User } from "../models/user";
import { Patient } from "../models/patient";
import { Diagnosis } from "../models/diagnosis";
import { Medication } from "../models/medication";
import { Allergy } from "../models/allergy";
import { Appointment } from "../models/appointment";
import { IAuthTokenRequest } from "../middleware/authMiddleware";
import { ILike, FindOperator, MoreThanOrEqual } from "typeorm";
import cache from "memory-cache";
import { encryptData } from "../services/encryption";

type Clause = Record<string, FindOperator<string> | string>;

const _checkPatientExists = async (patientId: string) => {
  if (!cache.get(patientId)) {
    const patientRepo = AppDataSource.getRepository(Patient);
    const patient = await patientRepo.findOne({ where: { id: patientId } });
    if (patient) {
      cache.put(patientId, patientId, 60000);
      return true;
    }
    return false;
  }
  return true;
};

export const fetchPatients = async (req: Request, res: Response) => {
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;
  const clause: Clause[] = [];

  if (req.query.search) {
    clause.push({ name: ILike(`%${req.query.search}%`) });
    clause.push({ email: ILike(`%${req.query.search}%`) });
  }

  const patientRepo = AppDataSource.getRepository(Patient);
  const [patients, count] = await patientRepo.findAndCount({
    where: clause,
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched patients",
    data: patients,
    meta: {
      totalItems: count,
      itemCount: patients.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const fetchPatientById = async (req: Request, res: Response) => {
  const { id: patientId } = req.params;
  const patientRepo = AppDataSource.getRepository(Patient);
  const patient = await patientRepo.findOne({ where: { id: patientId } });

  if (!patient) {
    res.status(404).json({ message: "Patient is not found" });
    return;
  }

  cache.put(patientId, patientId, 60000);
  res.send({
    message: "Fetched patient",
    data: patient,
  });
};

export const fetchDiagnoses = async (req: Request, res: Response) => {
  const { id: patientId } = req.params;
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  if (!(await _checkPatientExists(patientId))) {
    res.status(404).json({ message: "Patient is not found" });
    return;
  }

  const diagnosisRepo = AppDataSource.getRepository(Diagnosis);
  const [diagnoses, count] = await diagnosisRepo.findAndCount({
    where: <Clause>{ "patient.id": patientId },
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched diagnoses",
    data: encryptData(diagnoses),
    meta: {
      totalItems: count,
      itemCount: diagnoses.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const fetchMedications = async (req: Request, res: Response) => {
  const { id: patientId } = req.params;
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  if (!(await _checkPatientExists(patientId))) {
    res.status(404).json({ message: "Patient is not found" });
    return;
  }

  const medicationRepo = AppDataSource.getRepository(Medication);
  const [medications, count] = await medicationRepo.findAndCount({
    where: <Clause>{ "patient.id": patientId },
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched medications",
    data: encryptData(medications),
    meta: {
      totalItems: count,
      itemCount: medications.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const fetchAllergies = async (req: Request, res: Response) => {
  const { id: patientId } = req.params;
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  if (!(await _checkPatientExists(patientId))) {
    res.status(404).json({ message: "Patient is not found" });
    return;
  }

  const allergyRepo = AppDataSource.getRepository(Allergy);
  const [allergies, count] = await allergyRepo.findAndCount({
    where: <Clause>{ "patient.id": patientId },
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched allergies",
    data: encryptData(allergies),
    meta: {
      totalItems: count,
      itemCount: allergies.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

export const fetchAppointments = async (req: Request, res: Response) => {
  const { id: patientId } = req.params;
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  if (!(await _checkPatientExists(patientId))) {
    res.status(404).json({ message: "Patient is not found" });
    return;
  }

  const appointmentsRepo = AppDataSource.getRepository(Appointment);
  const [appointments, count] = await appointmentsRepo.findAndCount({
    where: <Clause>{
      date: MoreThanOrEqual(new Date().toISOString().slice(0, 10)),
      "patient.id": patientId,
    },
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched appointments",
    data: appointments,
    meta: {
      totalItems: count,
      itemCount: appointments.length,
      limit,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    },
  });
};

// ------

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { name, age, gender, email, phone } = req.body;
    const patient = new Patient();
    patient.name = name;
    patient.age = age;
    patient.gender = gender;
    patient.email = email;
    patient.phone = phone;

    const patientRepo = AppDataSource.getRepository(Patient);
    await patientRepo.save(patient);

    res.send({
      message: "Patient created successfully",
      data: patient,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create patient" });
  }
};

export const createDiagnosis = async (
  req: IAuthTokenRequest,
  res: Response
) => {
  try {
    const { name, description } = req.body;
    const { id: patientId } = req.params;

    const patientRepo = AppDataSource.getRepository(Patient);
    const patient = await patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: "Patient is not found" });
      return;
    }

    const diagnosis = new Diagnosis();
    diagnosis.name = name;
    diagnosis.description = description;
    diagnosis.patient = patient;
    diagnosis.doctor = req.currentUser?.id;

    const diagnosisRepo = AppDataSource.getRepository(Diagnosis);
    await diagnosisRepo.save(diagnosis);

    res.send({
      message: "Diagnosis created successfully",
      data: diagnosis,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create diagnosis" });
  }
};

export const createMedication = async (
  req: IAuthTokenRequest,
  res: Response
) => {
  try {
    const { name, dosage, frequency } = req.body;
    const { id: patientId } = req.params;

    const patientRepo = AppDataSource.getRepository(Patient);
    const patient = await patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: "Patient is not found" });
      return;
    }

    const medication = new Medication();
    medication.name = name;
    medication.dosage = dosage;
    medication.frequency = frequency;
    medication.patient = patient;
    medication.createdBy = req.currentUser?.id;

    const medicationRepo = AppDataSource.getRepository(Medication);
    await medicationRepo.save(medication);

    res.send({
      message: "Medication created successfully",
      data: medication,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create medication" });
  }
};

export const createAllergy = async (req: IAuthTokenRequest, res: Response) => {
  try {
    const { name } = req.body;
    const { id: patientId } = req.params;

    const patientRepo = AppDataSource.getRepository(Patient);
    const patient = await patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: "Patient is not found" });
      return;
    }

    const allergy = new Allergy();
    allergy.name = name;
    allergy.patient = patient;
    allergy.createdBy = req.currentUser?.id;

    const allergyRepo = AppDataSource.getRepository(Allergy);
    await allergyRepo.save(allergy);

    res.send({
      message: "Allergy created successfully",
      data: allergy,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create allergy" });
  }
};

export const createAppointment = async (
  req: IAuthTokenRequest,
  res: Response
) => {
  try {
    const { doctorId, date, time, roomNumber } = req.body;
    const { id: patientId } = req.params;

    const patientRepo = AppDataSource.getRepository(Patient);
    const patient = await patientRepo.findOne({ where: { id: patientId } });
    if (!patient) {
      res.status(404).json({ message: "Patient is not found" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: doctorId } });
    if (!user) {
      res.status(404).json({ message: "Doctor is not found" });
      return;
    }

    const appointment = new Appointment();
    appointment.date = date;
    appointment.time = time;
    appointment.roomNumber = roomNumber;
    appointment.patient = patient;
    appointment.doctor = doctorId;
    appointment.createdBy = req.currentUser?.id;

    const appointmentRepo = AppDataSource.getRepository(Appointment);
    await appointmentRepo.save(appointment);

    const io = req.app.get("socketio");
    io.emit("newAppointment", appointment);

    res.send({
      message: "Appointment created successfully",
      data: appointment,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create appointment" });
  }
};
