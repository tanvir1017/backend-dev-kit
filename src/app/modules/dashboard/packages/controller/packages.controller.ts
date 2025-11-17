import { GoodTypes } from "@prisma/client";
import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../../lib/utils/async-handler";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import PackageService from "../service/packages.service";
import {
  I_PackageQcDetailsPayload,
  I_PackagesGetPayload,
} from "../types/packages.types";

export default class PackageController {
  private pkgService: PackageService;
  constructor() {
    this.pkgService = new PackageService();
  }

  // Get single package information
  getSingleInformation = asyncHandler(async (req, res) => {
    const params = req.params;
    const result = await this.pkgService.getThepackageById(params.pkgId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Packages retrieved successfully",
      data: result,
    });
  });

  // Get all the packages
  getAllThePackages = asyncHandler(async (req, res) => {
    const query = req.query as typeof req.query & I_PackagesGetPayload;
    const result = await this.pkgService.getAllThePackages(query);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Packages retrieved successfully",
      data: result,
    });
  });

  // Get all the packages
  assignWsOrPa = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const body = req.body as typeof req.body & {
      wsId: string;
      paId: string;
    };
    const result = await this.pkgService.assignWsOrPa({ payload: body, user });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assign ws or pa successfully",
      data: result,
    });
  });

  // Update package details
  updatePackageDetails = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const params = req.params;
    const body = req.body as typeof req.body & {
      trackingNo: string;
      courierCompany: string;
      trackingLink: string;
      typeOfGoods: GoodTypes[];
      status: string;
    };
    const result = await this.pkgService.updatePackageDetails(
      {
        pkgId: params.pkgId,
        ...body,
      },
      user,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Package data update successfully",
      data: result,
    });
  });

  // Update or create the package qc details
  updateOrCreatePackageQcDetails = asyncHandler(async (req, res) => {
    const body = req.body as I_PackageQcDetailsPayload;
    const user = req.user as I_GlobalJwtPayload;
    const { isCreated, result } =
      await this.pkgService.updateOrCreatePackageQcDetails({
        payload: body,
        user,
      });
    sendResponse(res, {
      statusCode: isCreated ? HttpStatusCode.Created : HttpStatusCode.Ok,
      success: true,
      message: `Package qc details ${isCreated ? "created" : "updated"} successfully`,
      data: result,
    });
  });
}
