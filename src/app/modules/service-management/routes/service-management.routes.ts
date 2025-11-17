import { Router } from "express";
import { serviceManagementController } from "../controller/service-management.controller";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { serviceManagementValidation } from "../validation/service-management.validation";

const router = Router();

// ** get all service managements
router.route("/").get(serviceManagementController.getAllServiceManagements);

// ** get single service managements
router
  .route("/:id")
  .get(serviceManagementController.getSingleServiceManagement);

// ** create service managements
router
  .route("/")
  .post(
    sanitizeInputData(serviceManagementValidation.newServiceManagement),
    serviceManagementController.createServiceManagement,
  );

// ** update service managements
router
  .route("/:id")
  .patch(
    sanitizeInputData(serviceManagementValidation.newServiceManagement),
    serviceManagementController.updateServiceManagement,
  );

// ** delete service managements
router
  .route("/:id")
  .delete(serviceManagementController.deleteServiceManagement);

export const serviceManagementRoutes = router;
