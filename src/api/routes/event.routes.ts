import { Router } from "express";

import { UserRole } from "../../dtos/auth.dto";
import { fileUpload } from "../../infrastructure/middleware/Application/file-upload.middleware";
import { hasRole } from "../../infrastructure/middleware/Auth/hasRole.middleware";
import { isUser } from "../../infrastructure/middleware/Auth/isUser.middleware";
import { EventController } from "../controller/event.controller";

const router = Router();
const eventController = new EventController();
router.get("/", eventController.get);
router.post(
  "/",
  isUser,
  hasRole([UserRole.COMPANY, UserRole.INDIVIDUAL, UserRole.SUPERADMIN]),
  fileUpload.array("images"),
  eventController.post,
);
router.route("/:id").get(eventController.getById).put(isUser, eventController.put);

router.post("/book/:id", isUser, eventController.book);
router.post("/verify-booking/:id", isUser, eventController.verify_booking);

router.post("/check-in/:id", isUser, eventController.check_in);

router.get("/approval/pending", isUser, hasRole([UserRole.SUPERADMIN]), eventController.getUnapproved);
router.get("/approval/complete", isUser, hasRole([UserRole.SUPERADMIN]), eventController.getApproved);

router.put("/toggle-approval/:id", isUser, hasRole([UserRole.SUPERADMIN]), eventController.toggleApproval);

router.put("/toggle-publish/:id", isUser, eventController.togglePublish);

router.get("/recommend/me", isUser, eventController.events_recommendations);

router.post("/add-to-favorites/:id", isUser, eventController.add_to_favorites);
router.get("/get-booked-dates/venues", eventController.get_booked_dates_for_venues);

export default router;
