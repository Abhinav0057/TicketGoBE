import bcrypt from "bcrypt";
export class BcryptProvider {
  private bcrypt = bcrypt;
  private rounds = 10;

  make = async (data: string, rounds = this.rounds) => {
    return this.bcrypt.hashSync(data, rounds);
  };

  compare = async (data: string, digest: string) => {
    return this.bcrypt.compareSync(data, digest);
  };
}
