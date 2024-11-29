import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
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
import { UserFactory } from "../seeds/userFactory";
import MainSeeder from "../seeds/mainSeeder";

const AppDataSource = new DataSource(<DataSourceOptions & SeederOptions>{
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: NODE_ENV === "development" ? true : false,
  logging: NODE_ENV === "development" ? false : false,
  entities: [User],
  migrations: [__dirname + "/migrations/*.ts"],
  factories: [UserFactory],
  seeds: [MainSeeder],
});

AppDataSource.initialize().then(async () => {
  await AppDataSource.synchronize(true);
  await runSeeders(AppDataSource);
  process.exit();
});
