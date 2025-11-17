import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { bulletinService } from "../service/bulletin.service";

// ** get all bulletin
const getAllBulletin = asyncHandler(async (req, res) => {
  const results = await bulletinService.getAllBulletin(req.query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting bulletin success",
    data: results,
  });
});

// ** get single bulletin
const getSingleBulletin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await bulletinService.getSingleBulletin(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single bulletin success",
    data: result,
  });
});

// ** create new bulletin
const createNewBulletin = asyncHandler(async (req, res) => {
  const result = await bulletinService.createNewBulletin(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Creating new bulletin success",
    data: result,
  });
});

// ** update bulletin
const updateBulletin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await bulletinService.updateBulletin(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Update bulletin success",
    data: result,
  });
});

// ** delete bulletin
const deleteBulletin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await bulletinService.deleteBulletin(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Delete bulletin success",
    data: null,
  });
});

export const bulletinController = {
  getAllBulletin,
  getSingleBulletin,
  createNewBulletin,
  updateBulletin,
  deleteBulletin,
};
