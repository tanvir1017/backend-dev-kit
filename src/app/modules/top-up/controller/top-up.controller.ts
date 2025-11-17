import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import TopUpService from "../service/top-up.service";

const TopUp = new TopUpService();

export const topUpController = {
  topUpBalance: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const result = await TopUp.createTopUpAndSavePaymentInfo({
      user,
      topUpAmount: req.body.amount,
    });

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Top up request successful",
      data: result,
    });
  }),

  getUserBalance: asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;

    const customer = await TopUp.getUserBalance({ user });
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Retrieve user balance successful",
      data: customer,
    });
  }),
};
