import { Auth } from "../../database/entity/Auth";
import { JWTprovider } from "../../infrastructure/services/Auth/Providers/jwt.provider";
import { HashService } from "../../infrastructure/services/Hash/hash.service";
import { Service } from ".";

export class AuthService extends Service<Auth> {
  constructor() {
    super(Auth);
  }
  get_token = async (password: string, auth: Partial<Auth>) => {
    if (await new HashService().compare(password, auth.password)) {
      const jwt = new JWTprovider();
      const token = jwt.sign({
        id: auth.id,
        roles: auth.role,
      });
      return token;
    } else Promise.reject("Bad data");
  };
}
