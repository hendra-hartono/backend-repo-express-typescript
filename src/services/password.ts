import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const { JWT_KEY = "" } = process.env;

export class Password {
  static async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static comparePassword(password: string, hashPassword: string) {
    return bcrypt.compare(password, hashPassword);
  }

  static generateToken(
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string
  ) {
    return jwt.sign(
      { id: userId, email: userEmail, name: userName, role: userRole },
      JWT_KEY,
      {
        expiresIn: "5h",
      }
    );
  }

  static verifyToken(token: string) {
    return jwt.verify(token, JWT_KEY);
  }
}
