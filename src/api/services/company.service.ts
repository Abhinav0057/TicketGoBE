import { Company } from "../../database/entity/Company";
import { Service } from ".";

export class CompanyService extends Service<Company> {
  constructor() {
    super(Company);
  }
}
