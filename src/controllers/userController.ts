import { Request, Response } from "express";
import { AppDataSource } from "../services/db";
import { User } from "../models/user";
import { UserResponse } from "../dto/user.dto";
import { Password } from "../services/password";
import { IAuthTokenRequest } from "../middleware/authMiddleware";

export const fetchCurrentUser = (req: IAuthTokenRequest, res: Response) => {
  if (req.currentUser === undefined) {
    res.send({ data: null });
    return;
  }

  const userDTO = new UserResponse();
  userDTO.id = req.currentUser.id;
  userDTO.name = req.currentUser.name;
  userDTO.email = req.currentUser.email;
  userDTO.role = req.currentUser.role;
  res.send({ data: userDTO });
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await Password.encryptPassword(password);
    user.role = role;

    const userRepo = AppDataSource.getRepository(User);
    const exist = await userRepo.findOne({ where: { email } });
    if (exist) {
      res.status(400).json({ message: "Email has already existed" });
      return;
    }

    await userRepo.save(user);

    const userDTO = new UserResponse();
    userDTO.name = user.name;
    userDTO.email = user.email;
    userDTO.role = user.role;

    res.send({
      message: "User created successfully",
      data: userDTO,
    });
  } catch (error) {
    res.status(400).send({
      message: "Failed to create user",
      data: null,
    });
  }
};
