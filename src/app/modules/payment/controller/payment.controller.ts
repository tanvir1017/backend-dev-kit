import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import asyncHandler from "../../../../lib/utils/async-handler";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { T_PackagePayload } from "../../user-account/u-account/types/u-account.types";
import getShippingCostIntent from "../service/checkout-shipping-cost.service";
import PaymentService from "../service/payment.service";
import { I_RefundPayload } from "../types/payment.types";

const paymentService = new PaymentService();
class PaymentController {
  constructor() {}
  // Create checkout session
  createCheckoutSession = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const { orderId } = req.params as {
      orderId: string;
    };

    const { isUseCustomerBalance } = req.query as typeof req.query & {
      isUseCustomerBalance: "true" | "false";
    };

    const session = await paymentService.createCheckoutSession({
      user: user,
      orderId,
      isUseCustomerBalance,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Checkout session created successfully",
      data: session,
    });
  });

  // Create checkout session
  createProductShippingPayment = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const body = req.body as T_PackagePayload;
    const result = await getShippingCostIntent({
      user,
      payload: body,
    });
    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Product shipping payment initiated successfully",
      data: result,
    });
  });

  // Initiate the refund process
  initRefund = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const { orderId } = req.params as {
      orderId: string;
    };
    const payload = req.body as typeof req.body & I_RefundPayload;

    const session = await paymentService.initiateTheRefundProcess({
      user,
      orderId,
      payload,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Initiate the refund process successfully",
      data: session,
    });
  });

  // Initiate the refund process
  initRefundForPackage = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const { pkgId } = req.params as {
      pkgId: string;
    };

    const payload = req.body as typeof req.body & I_RefundPayload;

    const session = await paymentService.initiateThePkgRefundProcess({
      user,
      pkgId,
      payload,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Initiate the refund process successfully",
      data: session,
    });
  });

  // Retrieve refund list
  getRefundList = asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      q,
      starting_after,
      ending_before,
    } = req.query;

    const session = await paymentService.retrieveRefundList({
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      q: q as string,
      starting_after: starting_after as string,
      ending_before: ending_before as string,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Refund list retrieved successfully",
      data: session,
    });
  });

  // Get order payments list
  getOrdersPaymentList = asyncHandler(async (req, res) => {
    const query = req.query as typeof req.query & I_PaginationOptions;
    const user = req.user as I_GlobalJwtPayload;
    const reqParams = req.params as {
      orderId: string;
    };
    const ordersPayments = await paymentService.retrieveOrdersPayments(
      query,
      reqParams,
      user,
    );

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Orders payment list retrieved successfully",
      data: ordersPayments,
    });
  });

  // Get available payment methods
  getPaymentMethods = asyncHandler(async (req: Request, res: Response) => {
    const { country = "US" } = req.query;
    const methods = await paymentService.getAvailablePaymentMethods(
      country as string,
    );

    res.status(200).json({
      success: true,
      data: methods,
    });
  });
}
export default PaymentController;
