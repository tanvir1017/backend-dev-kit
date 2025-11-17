import express from "express";
import { authenticate, requirePermission } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import PaymentController from "../controller/payment.controller";
import { paymentInputDataValidation } from "../validation/payment.validation";

const router = express.Router();
const paymentController = new PaymentController();

// Order payment checkout-session ~ when any user wants to place any order
router.post(
  "/create-checkout-session/:orderId",
  authenticate,
  paymentController.createCheckoutSession,
);

// Initiate the product shipping payment
router.post(
  "/initiate-product-shipping",
  authenticate,
  sanitizeInputData(paymentInputDataValidation.initiateProductShipping),
  paymentController.createProductShippingPayment,
);

// Initiate Refund money for the first time pay for order
router.post(
  "/init-refund/:orderId",
  authenticate,
  requirePermission("REIMBURSEMENTS"),
  sanitizeInputData(paymentInputDataValidation.initRefundAmount),
  paymentController.initRefund,
);

// Initiate Refund money for package shipping extra cost
router.post(
  "/init-refund-shipping-cost/:pkgId",
  authenticate,
  requirePermission("REIMBURSEMENTS"),
  sanitizeInputData(paymentInputDataValidation.initRefundAmount),
  paymentController.initRefundForPackage,
);

// retrieve all the refund
router.get(
  "/refund-list",
  authenticate,
  requirePermission("REIMBURSEMENTS"),
  paymentController.getRefundList,
);

// Retrieve all payment list
router.get(
  "/orders-payment-lists/:orderId",
  authenticate,
  requirePermission("REIMBURSEMENTS"),
  paymentController.getOrdersPaymentList,
);

export const paymentRotes = router;
