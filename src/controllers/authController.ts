import { Request, Response } from "express";
import { AppDataSource } from "../services/db";
import { Password } from "../services/password";
import { User } from "../models/user";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "Invalid email or password." });
      return;
    }

    const isPasswordValid = Password.comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(404).json({ message: "Invalid email or password." });
      return;
    }

    const token = Password.generateToken(
      user.id,
      user.email,
      user.name,
      user.role
    );

    res.send({ message: "Login successful", data: { token } });
  } catch (error) {
    res.status(400).json({ message: "Failed to login" });
  }
};
