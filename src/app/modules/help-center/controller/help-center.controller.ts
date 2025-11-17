import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { helpCenterInfoService } from "../service/help-center.service";

// ** get help center info
const getHelpCenterInfo = asyncHandler(async (req, res) => {
  const helpCenterInfo = await helpCenterInfoService.getHelpCenterInfo();

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting help center info success",
    data: helpCenterInfo,
  });
});

// ** update center info
const updateHelpCenterInfo = asyncHandler(async (req, res) => {
  const helpCenterInfo = await helpCenterInfoService.updateHelpCenterInfo(
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating help center info success",
    data: helpCenterInfo,
  });
});

export const helpCenterInfoController = {
  updateHelpCenterInfo,
  getHelpCenterInfo,
};
