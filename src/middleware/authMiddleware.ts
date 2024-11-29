import { Request, Response, NextFunction } from "express";
import { Password } from "../services/password";
import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";

export interface IAuthTokenRequest extends Request {
  currentUser?: JwtPayload;
}

export const authentification = (
  req: IAuthTokenRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    res
      .status(401)
      .json({ message: "Access denied - Unauthorized", data: null });
    return;
  }

  const token = header.split(" ")[1];
  if (!token) {
    res
      .status(401)
      .json({ message: "Access denied - Unauthorized", data: null });
    return;
  }

  try {
    const decoded = Password.verifyToken(token) as JwtPayload;
    if (!decoded) {
      res
        .status(401)
        .json({ message: "Access denied - Unauthorized", data: null });
      return;
    }
    req.currentUser = decoded;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ message: "Access denied - Unauthorized", data: null });
    return;
  }
};

export const authorization = (roles: string[]) => {
  return async (req: IAuthTokenRequest, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      res
        .status(403)
        .json({ message: "Access denied - Forbidden", data: null });
      return;
    }

    const user = req.currentUser;
    if (!roles.includes(user.role)) {
      res
        .status(403)
        .json({ message: "Access denied - Forbidden", data: null });
      return;
    }

    next();
  };
};

export const socketAuthentification = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = Password.verifyToken(token) as JwtPayload;
      if (!decoded) next(new Error("Socket Access denied - Unauthorized"));
      next();
    } catch (err) {
      next(new Error("Socket Access denied - Unauthorized"));
    }
  } else {
    next(new Error("Socket Access denied - Unauthorized"));
  }
};
