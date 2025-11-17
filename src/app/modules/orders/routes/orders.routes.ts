import { Router } from "express";
import { authenticate, requirePermission } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { orderController } from "../controller/orders.controller";
import { addToCartValidation } from "../validation/orders.validation";

const orderRouter: Router = Router();

orderRouter.route("/orders").get(
  // authenticate first
  authenticate,
  // check the access control
  requirePermission("PRODUCT_LIST"), // means all order lists
  orderController.getAllProductLists,
);

orderRouter.route("/add-to-cart").post(
  // authenticate first
  authenticate,
  // sanitize the input data
  sanitizeInputData(addToCartValidation.create),
  orderController.addToCartProduct,
);

orderRouter.route("/remove-from-cart").delete(
  // authenticate first
  authenticate,
  orderController.removeProductFromCart,
);

orderRouter.route("/get-my-carts").get(
  // authenticate first
  authenticate,
  orderController.getMyCarts,
);

orderRouter.route("/addon-service").post(
  // authenticate first
  authenticate,
  // sanitize the input data
  sanitizeInputData(addToCartValidation.addOnSchema),
  orderController.addonServiceOnOrder,
);

orderRouter.route("/remove-addon-service").delete(
  // authenticate first
  authenticate,
  // sanitize the input data
  sanitizeInputData(addToCartValidation.addOnSchema),
  orderController.removeAddonService,
);
export const orderRoutes = orderRouter;
