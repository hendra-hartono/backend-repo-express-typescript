import express from "express";
import { body, param } from "express-validator";
import { authentification, authorization } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequestMiddleware";
import {
  fetchPatients,
  fetchPatientById,
  fetchDiagnoses,
  fetchMedications,
  fetchAllergies,
  fetchAppointments,
  createPatient,
  createDiagnosis,
  createMedication,
  createAllergy,
  createAppointment,
} from "../controllers/patientController";

const router = express.Router();

router.get(
  "/patients",
  authentification,
  authorization(["doctor", "nurse"]),
  fetchPatients
);

router.get(
  "/patients/:id",
  authentification,
  authorization(["doctor", "nurse"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Patient Id")],
  validateRequest,
  fetchPatientById
);

router.get(
  "/patients/:id/diagnoses",
  authentification,
  authorization(["doctor"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Patient Id")],
  validateRequest,
  fetchDiagnoses
);

router.get(
  "/patients/:id/medications",
  authentification,
  authorization(["doctor"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Patient Id")],
  validateRequest,
  fetchMedications
);

router.get(
  "/patients/:id/allergies",
  authentification,
  authorization(["doctor", "nurse"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Patient Id")],
  validateRequest,
  fetchAllergies
);

router.get(
  "/patients/:id/appointments",
  authentification,
  authorization(["doctor", "nurse"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Patient Id")],
  validateRequest,
  fetchAppointments
);

// -----

router.post(
  "/patients",
  authentification,
  authorization(["doctor", "nurse"]),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("age").notEmpty().isNumeric().withMessage("Age is required"),
    body("gender")
      .notEmpty()
      .custom((val) => ["male", "female"].includes(val))
      .withMessage("Invalid Gender"),
  ],
  validateRequest,
  createPatient
);

router.post(
  "/patients/:id/diagnoses",
  authentification,
  authorization(["doctor"]),
  [
    param("id").notEmpty().isUUID().withMessage("Invalid Patient Id"),
    body("name").notEmpty().withMessage("Diagnosis Name is required"),
    body("description")
      .notEmpty()
      .withMessage("Diagnosis Description is required"),
  ],
  validateRequest,
  createDiagnosis
);

router.post(
  "/patients/:id/medications",
  authentification,
  authorization(["doctor"]),
  [
    param("id").notEmpty().isUUID().withMessage("Invalid Patient Id"),
    body("name").notEmpty().withMessage("Medication Name is required"),
    body("dosage").notEmpty().withMessage("Dosage is required"),
    body("frequency").notEmpty().withMessage("Frequency is required"),
  ],
  validateRequest,
  createMedication
);

router.post(
  "/patients/:id/allergies",
  authentification,
  authorization(["doctor"]),
  [
    param("id").notEmpty().isUUID().withMessage("Invalid Patient Id"),
    body("name").notEmpty().withMessage("Medication Name is required"),
  ],
  validateRequest,
  createAllergy
);

router.post(
  "/patients/:id/appointments",
  authentification,
  authorization(["doctor", "nurse"]),
  [
    param("id").notEmpty().isUUID().withMessage("Invalid Patient Id"),
    body("doctorId").notEmpty().isUUID().withMessage("Invalid Doctor Id"),
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("roomNumber").notEmpty().withMessage("Room Number is required"),
  ],
  validateRequest,
  createAppointment
);

export { router as patientRouter };
