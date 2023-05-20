import { Expose, plainToClass } from "class-transformer";
import { IsDefined, IsEmail, Length, Matches, validate, ValidateIf } from "class-validator";
import { Equal } from "typeorm";

import { UserRole } from "./auth.dto";

export type CategoryRequestDTO = {
  name: string;
};

// export class AuthRegisterDTO {
//   @IsDefined()
//   @Expose()
//   userName: String;

//   @IsDefined()
//   @Expose()
//   password: String;

//   @IsEmail()
//   @Expose()
//   email: String;

//   @IsDefined()
//   @Expose()
//   name: String;

//   @ValidateIf((o) => o.role === UserRole.COMPANY)
//   @IsDefined()
//   @Expose()
//   companyName: String;

//   @ValidateIf((o) => o.role === UserRole.COMPANY)
//   @IsDefined()
//   @Expose()
//   companyPAN: String;

//   @ValidateIf((o) => o.role === UserRole.COMPANY)
//   @Expose()
//   companyReg: String;

//   @IsDefined()
//   @Expose()
//   @Length(10)
//   phoneNo: String;

//   @IsDefined()
//   @Expose()
//   citizenNo: String;

//   @IsDefined()
//   @Expose()
//   @Matches(
//     `^${Object.values(Gender)
//       .filter((v) => typeof v !== "number")
//       .join("|")}$`,
//     "i",
//   )
//   gender: Gender;

//   @Expose()
//   @Matches(
//     `^${Object.values(UserRole)
//       .filter((v) => typeof v !== "number")
//       .join("|")}$`,
//     "i",
//   )
//   role: UserRole;

//   @IsDefined()
//   @Expose()
//   dob: String;
// }
