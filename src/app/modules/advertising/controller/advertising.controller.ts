import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { advertisingService } from "../service/advertising.service";

// ** get advertising
const getAdvertising = asyncHandler(async (req, res) => {
  const advertising = await advertisingService.getAdvertising();

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting Advertising success",
    data: advertising,
  });
});

// ** update advertising
const updateAdvertising = asyncHandler(async (req, res) => {
  const file = req.file as Express.Multer.File;
  const update = await advertisingService.updateAdvertising(req.body, file);
  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating Advertising success",
    data: update,
  });
});

export const advertisingController = {
  getAdvertising,
  updateAdvertising,
};
