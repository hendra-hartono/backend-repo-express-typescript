import express from "express";
import { json } from "body-parser";
import { AppDataSource } from "./services/db";
import cors from "cors";
import { Server, Socket } from "socket.io";
import { userRouter } from "./routes/userRoutes";
import { patientRouter } from "./routes/patientRoutes";
import { doctorRouter } from "./routes/doctorRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import { socketAuthentification } from "./middleware/authMiddleware";

const app = express();
app.use(json());
app.use(cors());

app.use(userRouter);
app.use(patientRouter);
app.use(doctorRouter);
app.use(errorHandler);

const port = process.env.PORT || 8000;

AppDataSource.initialize()
  .then(async () => {
    const server = app.listen(port, () => {
      console.log(`Listening on port ${port}!!!`);
    });

    const io = new Server(server, {
      cors: {
        origin: process.env.CONSUMER_URL,
        methods: ["GET", "POST"],
      },
    });
    io.use(socketAuthentification);
    io.on("connection", (socket: Socket) => {
      socket.on("disconnect", () => {});
    });
    app.set("socketio", io);
  })
  .catch((error) => console.log(error));
