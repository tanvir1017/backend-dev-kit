import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { LogController } from "../controller/logger.controller";

const router = Router();
const logController = new LogController();

// All log routes require authentication
router.use(authenticate);

// Only admin and super admin can access logs
router.get("/", logController.getLogs);
//router.get("/:id", logController.getLogById);
router.delete("/cleanup", logController.cleanupLogs);

export default router;
