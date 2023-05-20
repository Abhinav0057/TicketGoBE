import { v4 } from "uuid";

import { Gender, UserRole } from "../../dtos/auth.dto";
import { AppDataSource } from "../config";
import { Auth } from "../entity/Auth";

export const createSuperAdmin = async () => {
  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Auth)
    .values([
      {
        id: v4(),
        email: "some-email@gmail.com",
        userName: "ticket-go-superAdmin",
        password: "$2b$10$92RPyUcH0H8rRoH2oIR2n.mYFoAqt/XG2NTlZov6Uy5abldebonPq", //super@dmin123$
        createdAt: "2023-03-24T07:50:07.636Z",
        updatedAt: "2023-03-24T07:50:07.636Z",
        role: UserRole.SUPERADMIN,
      },
    ])
    .execute();
  console.log("SuperAdmin Created");
};
