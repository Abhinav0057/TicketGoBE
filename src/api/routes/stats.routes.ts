import { Router } from "express";

import { StatsController } from "../controller/stats.controller";

const router = Router();
const statsController = new StatsController();
router.get("/tickets/:id", statsController.boughtTickets);
router.get("/", statsController.timelyStats);
export default router;
