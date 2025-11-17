import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import asyncHandler from "../../../../../lib/utils/async-handler";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import { T_ReqSourceType } from "../../../auth/types/auth.types";
import {
  setAccessToken,
  setRefreshToken,
} from "../../../auth/utils/auth.utils";
import DashboardUserService from "../service/dashboard-user.service";
import { T_DashUserSchema } from "../types/dashboard-user.types";

class DashboardUserControllers {
  private dashboardServices: DashboardUserService;
  constructor() {
    this.dashboardServices = new DashboardUserService();
  }

  createDashUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.dashboardServices.createDashboardUserIntoDb({
      payload: req.body as T_DashUserSchema["body"],
      user: req.user as I_GlobalJwtPayload,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Created,
      message:
        "Dashboard user created successfully. Respected user will get an email to verify their account",
      success: true,
      data: result,
    });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as { email: string; password: string };
    const reqSource =
      (req.headers["x-client-source"] as T_ReqSourceType) || "web";

    const { accessToken, refreshToken } =
      await this.dashboardServices.loginDashUser({
        payload: body,
        reqSource,
      });

    // before sending response set the `access` token and `refresh` token into browser cookie
    setAccessToken(res, accessToken, reqSource);
    setRefreshToken(res, refreshToken, reqSource);

    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "User logged in successfully!",
      data: accessToken,
    });
  });
}
export const dashboardUserControllers = new DashboardUserControllers();
