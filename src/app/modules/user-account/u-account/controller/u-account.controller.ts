import { ProductStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../../lib/utils/async-handler";
import { I_PaginationOptions } from "../../../../../lib/utils/calcPagination";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import UserAccService from "../service/u-account.service";
import { I_GetMyParcelQuery, T_PackagePayload } from "../types/u-account.types";

class UserAccController {
  private userAccService: UserAccService;
  constructor() {
    this.userAccService = new UserAccService();
  }

  getAllProductForUser = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const query = req.query as typeof req.query &
      I_PaginationOptions & {
        q?: string;
        status?: ProductStatus;
      };
    const { q, status, ...rest } = query;

    const result = await this.userAccService.getAllProductForUser({
      //user,
      paginationQuery: rest,
      q: q,
      status: status,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Product retrieved successfully",
      data: result,
    });
  });

  getMyWarehouseOrders = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const query = req.query as typeof req.query &
      I_PaginationOptions & {
        q?: string;
        status?: ProductStatus;
      };
    const { q, status, ...rest } = query;

    const result = await this.userAccService.getAllWarehouseProductForUser({
      user,
      paginationQuery: rest,
      q: q,
      status: status,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Warehouse product retrieved successfully",
      data: result,
    });
  });

  createPackage = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const payload = req.body as T_PackagePayload;
    const result = await this.userAccService.createPackage({
      user,
      packagePayload: payload,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message:
        "Package listed successfully & checkout session initiated for shipping fee",
      data: result,
    });
  });

  //////////////////////////////////////////////////
  //  _> Parcel //////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getMyParcels = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const query = req.query as typeof req.query & I_GetMyParcelQuery;

    const result = await this.userAccService.getMyParcels({
      user,
      query,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Parcels retrieved successfully",
      data: result,
    });
  });
}

export default UserAccController;
