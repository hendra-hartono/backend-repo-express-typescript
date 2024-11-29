import { Request, Response } from "express";
import { AppDataSource } from "../services/db";
import { User } from "../models/user";
import { Appointment } from "../models/appointment";
import { FindOperator, MoreThanOrEqual } from "typeorm";
import cache from "memory-cache";

type Clause = Record<string, FindOperator<string> | string>;

export const fetchAppointments = async (req: Request, res: Response) => {
  const { id: doctorId } = req.params;
  const limit: number = req.query.limit ? Number(req.query.limit) : 10;
  const page: number = req.query.page ? Number(req.query.page) : 1;
  const skip: number = (page - 1) * limit;

  if (!cache.get(doctorId)) {
    const userRepo = AppDataSource.getRepository(User);
    const doctor = await userRepo.findOne({
      where: { id: doctorId, role: "doctor" },
    });
    if (!doctor) {
      res.status(404).json({ message: "Doctor is not found" });
      return;
    }
    cache.put(doctorId, doctorId, 60000);
  }

  const appointmentsRepo = AppDataSource.getRepository(Appointment);
  const [appointments, count] = await appointmentsRepo.findAndCount({
    where: <Clause>{
      date: MoreThanOrEqual(new Date().toISOString().slice(0, 10)),
      "doctor.id": doctorId,
    },
    relations: {
      patient: true,
    },
    select: {
      patient: {
        name: true,
      },
    },
    skip,
    take: limit,
  });

  res.send({
    message: "Fetched doctor appointments",
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
