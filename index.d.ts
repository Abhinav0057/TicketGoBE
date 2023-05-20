import { Request } from "express";
import { Auth } from "./src/database/entity/Auth";
import { Company } from "./src/database/entity/Company";
import { User } from "./src/database/entity/User";

export type TypedRequest<P, Q, R, S> = Request<P, Q, R, S> & {
  auth: Auth;
};
