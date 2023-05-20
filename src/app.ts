import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";

import indexRouter from "./api/routes/index.route";
import { ErrorHandlingMiddleware } from "./infrastructure/middleware/Application/error.middleware";
import { scheduleCron } from "./infrastructure/services/Cron/cron.service";

class App {
  app: Express;
  constructor() {
    this.app = express();
    this.initMiddlewares();
    this.serveRoutes();
    dotenv.config();
    this.NotFoundHandler();
    this.errorHandler();
    scheduleCron();
  }
  initMiddlewares() {
    this.app.use(
      cors({
        origin: "*",
        optionsSuccessStatus: 200,
      }),
    );
    this.app.use(morgan("combined"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet());
    this.app.use(cookieParser());
    this.setupCloudinary();
  }
  setupCloudinary() {
    cloudinary.v2.config({
      cloud_name: process.env.cloudinary_cloud_name,
      api_key: process.env.cloudinary_api_key,
      api_secret: process.env.cloudinary_api_secret,
    });
  }
  serveRoutes() {
    this.app.get("/", (_, res) => res.send("WORKING"));
    this.app.use("/apiV1", indexRouter);
  }
  NotFoundHandler() {
    this.app.use((req: Request, res: Response) => {
      res.status(404).json("Not Found");
    });
  }
  errorHandler() {
    this.app.use(ErrorHandlingMiddleware);
  }
}
export const app = new App().app;
