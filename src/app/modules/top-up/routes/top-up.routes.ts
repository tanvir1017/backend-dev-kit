import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import { topUpController } from "../controller/top-up.controller";

const router = Router();

// Top up customer balance
router.route("/topup-balance").post(authenticate, topUpController.topUpBalance);

// Get user balance from the stripe
router.route("/user-balance").get(authenticate, topUpController.getUserBalance);

export const TopUpRoutes = router;
