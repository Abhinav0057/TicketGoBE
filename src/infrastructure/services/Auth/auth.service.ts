import { JWTprovider } from "./Providers/jwt.provider";

export class AuthProviderService {
  private provider: any;

  constructor(authProvider = "jwt") {
    this.setProvider(authProvider);
  }

  setProvider = (provider: string) => {
    switch (provider) {
      case "jwt":
        this.provider = new JWTprovider();
        break;

      default:
        break;
    }
  };

  sign = (payload: object) => {
    return this.provider.sign(payload);
  };

  compare = (token: string) => {
    return this.provider.verify(token);
  };
}
