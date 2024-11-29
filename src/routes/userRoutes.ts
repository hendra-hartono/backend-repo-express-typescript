import express from "express";
import { body } from "express-validator";
import { authentification, authorization } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequestMiddleware";
import { AllRoles, Role } from "../models/user";
import { createUser, fetchCurrentUser } from "../controllers/userController";
import { login } from "../controllers/authController";

const router = express.Router();

router.get("/users/current", authentification, fetchCurrentUser);

router.post(
  "/login",
  [
    body("email").notEmpty().isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.post(
  "/users",
  authentification,
  authorization(["super-admin"]),
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").notEmpty().isEmail().withMessage("Invalid Email"),
    body("password").trim().notEmpty().withMessage("Password is required"),
    body("role")
      .notEmpty()
      .custom((val) => AllRoles.includes(val as Role))
      .withMessage("Invalid Role"),
  ],
  validateRequest,
  createUser
);

export { router as userRouter };
