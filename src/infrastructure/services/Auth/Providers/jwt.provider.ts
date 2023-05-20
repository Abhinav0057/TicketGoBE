import jwt from "jsonwebtoken";
export class JWTprovider {
  sign = (payload: object): object => {
    return {
      access_token: jwt.sign(payload, process.env.JWT_SECRET),
      expiresIn: "1w",
    };
  };

  verify = (access_token: string) => {
    return jwt.verify(access_token, process.env.JWT_SECRET);
  };
}
