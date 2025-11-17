import { Router } from "express";
import { authenticate, requirePermission } from "../../../../middleware/auth";
import sanitizeInputData from "../../../../middleware/sanitizeClientDataViaZod";
import AssignPurchasingAgentController from "../controller/assign-pa-and-ws.controller";
import { AssignPAOrWSValidation } from "../validation/assign-pa.validation";

const router = Router();
const PurchasingAgentCtrl = new AssignPurchasingAgentController();

router
  .route("/pa")
  .post(
    authenticate,
    requirePermission("ASSIGN_PA"),
    sanitizeInputData(AssignPAOrWSValidation.assignPA),
    PurchasingAgentCtrl.assignPurchasingAgent,
  );

// Assign the warehouse stuff
router
  .route("/ws")
  .post(
    authenticate,
    requirePermission("ASSIGN_WS"),
    sanitizeInputData(AssignPAOrWSValidation.assignWS),
    PurchasingAgentCtrl.assignWarehouseStuff,
  );

export const AssignPARoutes = router;
