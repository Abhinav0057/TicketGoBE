import { AppDataSource } from "../config";
import { categoryGroupSeeders, categorySeeders } from "./categories";
import { createSuperAdmin } from "./super-admin";

(async () => {
  await AppDataSource.initialize();
  await categoryGroupSeeders();
  await createSuperAdmin();
})();
