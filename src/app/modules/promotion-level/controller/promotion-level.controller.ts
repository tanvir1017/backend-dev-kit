import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { promotionLevelService } from "../service/promotion-level.service";

// ** get all promotional level
const getAllPromotionLevels = asyncHandler(async (req, res) => {
  const result = await promotionLevelService.getPromotionLevelFromDb(req.query);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    success: true,
    message: "Gating all promotional levels success",
    data: result,
  });
});

// ** get promotional level by id
const getPromotionLevelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await promotionLevelService.getPromotionLevelById(id);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    success: true,
    message: "Getting single promotional level success",
    data: result,
  });
});

// ** create new promotional levels
const createNewPromotionalLevel = asyncHandler(async (req, res) => {
  const result = await promotionLevelService.createNewPromotionalLevel(
    req.body,
  );

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    success: true,
    message: "Creating new promotional level success",
    data: result,
  });
});

// ** update promotional levels
const updatePromotionalLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await promotionLevelService.updatePromotionLevelFromDb(
    id,
    req.body,
  );

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    success: true,
    message: "Updating promotional level success",
    data: result,
  });
});

// ** delete promotional level
const deletePromotionLevelFromDb = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await promotionLevelService.deletePromotionLevelFromDb(id);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    success: true,
    message: "Deleting promotional level success",
    data: null,
  });
});

export const promotionLevelController = {
  getAllPromotionLevels,
  createNewPromotionalLevel,
  getPromotionLevelById,
  updatePromotionalLevel,
  deletePromotionLevelFromDb,
};
