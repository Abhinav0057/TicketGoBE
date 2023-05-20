import "reflect-metadata";

//fix for env not working
import { config } from "dotenv";
import { DataSource } from "typeorm";
config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.pg_host,
  port: +process.env.pg_port,
  username: process.env.pg_username,
  password: process.env.pg_password,
  database: process.env.database,
  entities: [__dirname + "/entity/*{.ts,.js}"],
  synchronize: true,
  logging: false,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
