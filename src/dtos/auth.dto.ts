import { Expose } from "class-transformer";
import { ArrayNotEmpty, IsDefined, IsEmail, Length, Matches } from "class-validator";

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  OTHER = "Other",
}

export enum UserRole {
  SUPERADMIN = "superadmin",
  INDIVIDUAL = "individual",
  COMPANY = "company",
  USER = "user",
}

export type AuthRegisterDTOType = {
  email: string;
  password: string;
  userName: string;
  role: UserRole;
};

export type AuthRegisterUserType = {
  name: string;
  gender: Gender;
  dob: string;
  phone: string;
  description?: string;
};

export class AuthRegisterDTO1 {
  @IsDefined()
  @Expose()
  userName: string;

  @IsDefined()
  @Expose()
  password: string;

  @IsDefined()
  @IsEmail()
  @Expose()
  email: string;

  @Expose()
  @Matches(
    `^${Object.values(UserRole)
      .filter((v) => typeof v !== "number")
      .join("|")}$`,
    "i",
  )
  role: UserRole;
}

export class AuthRegisterDTO2 {
  @IsDefined()
  @Expose()
  name: string;

  @IsDefined()
  @Expose()
  @Length(10)
  phone: string;

  @IsDefined()
  @Expose()
  @Matches(
    `^${Object.values(Gender)
      .filter((v) => typeof v !== "number")
      .join("|")}$`,
    "i",
  )
  gender: Gender;

  @IsDefined()
  @Expose()
  dob: string;
}

export class AuthRegisterDTO3 {
  @IsDefined()
  @Expose()
  name: string;

  @IsDefined()
  @Expose()
  PAN: string;

  @Expose()
  registrationNo: string;

  @IsDefined()
  @Expose()
  @Length(10)
  phone: string;

  @IsDefined()
  @Expose()
  registrationDate: string;

  @Expose()
  description: string;

  @IsDefined()
  @Expose()
  @ArrayNotEmpty()
  company_docs: string[];
}

export type AuthRegisterCompanyType = {
  name: string;
  PAN: string;
  registrationNo: string;
  phone: string;
  registrationDate: string;
  description: string;
};
