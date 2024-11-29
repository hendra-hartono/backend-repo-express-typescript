import express from "express";
import { param } from "express-validator";
import { authentification, authorization } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequestMiddleware";
import { fetchAppointments } from "../controllers/doctorController";

const router = express.Router();

router.get(
  "/doctors/:id/appointments",
  authentification,
  authorization(["doctor", "nurse"]),
  [param("id").notEmpty().isUUID().withMessage("Invalid Doctor Id")],
  validateRequest,
  fetchAppointments
);

export { router as doctorRouter };
