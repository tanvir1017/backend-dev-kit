import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import ShippingProviderController from "../controller/international-shipping-management.controller";
import { shippingProviderValidation } from "../validation/international-shipping-management.validation";

const router = Router();
const controller = new ShippingProviderController();

router
  .route("/")
  .post(
    authenticate,
    sanitizeInputData(shippingProviderValidation.create),
    controller.create,
  )
  .get(authenticate, controller.getAll);

// router
//   .route("/:id")
//   .get(authenticate, controller.getById)
//   .patch(
//     authenticate,
//     sanitizeInputData(shippingProviderValidation.update),
//     controller.update,
//   )
//   .delete(authenticate, controller.delete);

export const ShippingProviderRoutes = router;
