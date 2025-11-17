import asyncHandler from "../../../../../lib/utils/async-handler";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import AssignP_A_Service from "../service/assign-pa.service";
import { I_AssignWSProps } from "../types/assign-pa.types";

class AssignPurchasingAgentController {
  private assignPAService: AssignP_A_Service;
  constructor() {
    this.assignPAService = new AssignP_A_Service();
  }

  // Assign the purchasing agent
  assignPurchasingAgent = asyncHandler(async (req, res) => {
    const payload = req.body;
    const user = req.user as I_GlobalJwtPayload;

    const result = await this.assignPAService.assignPA({
      ...payload,
      user,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Purchasing agent assigned successfully",
      data: result,
    });
  });

  // Assign ware house stuff to an order
  assignWarehouseStuff = asyncHandler(async (req, res) => {
    const payload = req.body as I_AssignWSProps;
    const user = req.user as I_GlobalJwtPayload;

    const result = await this.assignPAService.assignWS({
      ...payload,
      user,
    });

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Warehouse stuff assigned successfully",
      data: result,
    });
  });
}

export default AssignPurchasingAgentController;
