import { NextFunction, Request, Response } from "express";
const sendErrorDev = (err: any, req: Request, res: Response) => {
  return res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.detail || err.message,
  });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
  return res.status(err.status || 500).json(err.message || "Something went Wrong!");
};

export const ErrorHandlingMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else {
    sendErrorProd(err, req, res);
  }
};
