import { HttpStatusCode } from "axios";
import { TCountryCode } from "countries-list";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { exchangeService } from "../service/exchange-rate.service";
import { T_CreateExchangeRateInput } from "../types/exchange-rate.types";

class ExchangeController {
  constructor() {}

  getAll = asyncHandler(async (req, res) => {
    const result = await exchangeService.getExchangeRateService();
    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Retrieve exchange rate successfully",
      data: result,
    });
  });

  createAExchangeRate = asyncHandler(async (req, res) => {
    const body = req.body as T_CreateExchangeRateInput;
    const creator = req.user as I_GlobalJwtPayload;
    const result = await exchangeService.createExchangeRateService({
      creator,
      payload: body,
    });
    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Created,
      message: "Create exchange rate successfully",
      data: result,
    });
  });

  updateAExchangeRate = asyncHandler(async (req, res) => {
    const body = req.body as {
      from: TCountryCode;
      to: TCountryCode;
      rate: number;
    };
    const id = req.params.id;
    const auditor = req.user as I_GlobalJwtPayload;

    const result = await exchangeService.updateExchangeRateService({
      id,
      payload: body,
      auditor,
    });
    sendResponse(res, {
      success: true,
      statusCode: HttpStatusCode.Ok,
      message: "Update the exchange rate successfully",
      data: result,
    });
  });
}

export const exchangeController = new ExchangeController();
