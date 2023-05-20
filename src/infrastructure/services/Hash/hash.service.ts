import { BcryptProvider } from "./Providers/bcrypt.provider";

export class HashService {
  private provider: any;

  constructor(hashProvider = "bcrypt") {
    this.setProvider(hashProvider);
  }

  setProvider = (provider: string) => {
    switch (provider) {
      case "bcrypt":
        this.provider = new BcryptProvider();
        break;

      default:
        break;
    }
  };

  hash = (data: string, rounds = 10) => {
    return this.provider.make(data, rounds);
  };

  compare = (data: string, digest: string) => {
    return this.provider.compare(data, digest);
  };
}
