import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

const { NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } =
  process.env;

if (
  !NODE_ENV ||
  !DB_HOST ||
  !DB_PORT ||
  !DB_USERNAME ||
  // !DB_PASSWORD ||
  !DB_DATABASE
)
  throw new Error(
    "NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE must be defined."
  );

import { User } from "../models/user";
import { Patient } from "../models/patient";
import { Diagnosis } from "../models/diagnosis";
import { Medication } from "../models/medication";
import { Allergy } from "../models/allergy";
import { Appointment } from "../models/appointment";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: NODE_ENV === "development" ? true : false,
  logging: NODE_ENV === "development" ? false : false,
  entities: [User, Patient, Diagnosis, Medication, Allergy, Appointment],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [],
});
