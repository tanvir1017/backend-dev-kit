import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import ShippingProviderService from "../service/international-shipping-management.service";
import { I_GetShippingProvidersQuery } from "../types/international-shipping-management.types";

class ShippingProviderController {
  private service: ShippingProviderService;

  constructor() {
    this.service = new ShippingProviderService();
  }

  create = asyncHandler(async (req, res) => {
    const result = await this.service.createProvider(req.body);
    sendResponse(res, {
      statusCode: HttpStatusCode.Created,
      success: true,
      message: "Shipping provider created successfully!",
      data: result,
    });
  });

  getAll = asyncHandler(async (req, res) => {
    const query = req.query as typeof req.query & I_GetShippingProvidersQuery;

    const result = await this.service.getAllProviders(query);
    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Shipping providers fetched successfully!",
      data: result,
    });
  });

  // getById = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const result = await this.service.getProviderById(id);
  //   sendResponse(res, {
  //     statusCode: HttpStatusCode.Ok,
  //     success: true,
  //     message: "Shipping provider fetched successfully!",
  //     data: result,
  //   });
  // });

  // update = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const result = await this.service.updateProvider(id, req.body);
  //   sendResponse(res, {
  //     statusCode: HttpStatusCode.Ok,
  //     success: true,
  //     message: "Shipping provider updated successfully!",
  //     data: result,
  //   });
  // });

  // delete = asyncHandler(async (req, res) => {
  //   const { id } = req.params;
  //   const result = await this.service.deleteProvider(id);
  //   sendResponse(res, {
  //     statusCode: HttpStatusCode.Ok,
  //     success: true,
  //     message: "Shipping provider deleted successfully!",
  //     data: result,
  //   });
  // });
}

export default ShippingProviderController;
