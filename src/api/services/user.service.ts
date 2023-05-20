import { User } from "../../database/entity/User";
import { Service } from ".";

export class UserService extends Service<User> {
  constructor() {
    super(User);
  }

  add_preferences = async (userId: string, categoryIds: string[]) => {
    for await (const categoryId of categoryIds) {
      await this.queryRunner.manager.query(
        `INSERT INTO users_preferences("userId", "categoryId") VALUES ('${userId}', '${categoryId}')`,
      );
    }
    return;
  };

  remove_user_from_those_who_have_company = async (users: User[]) =>
    users.map((user) => ({
      ...(user.company ? user.company : user),
    }));
}
