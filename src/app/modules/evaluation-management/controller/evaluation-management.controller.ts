import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { evaluationManagementService } from "../service/evaluation-management.service";

// ** get all Evaluation Management
const getAllEvaluationManagement = asyncHandler(async (req, res) => {
  const results = await evaluationManagementService.getAllEvaluationManagement(
    req.query,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all Evaluation Management success",
    data: results,
  });
});

// ** get evaluationManagement by id
const getSingleEvaluationManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evaluationManagement =
    await evaluationManagementService.getSingleEvaluationManagement(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single Evaluation Management success",
    data: evaluationManagement,
  });
});

// ** create new evaluationManagement
const createNewEvaluationManagement = asyncHandler(async (req, res) => {
  const evaluationManagement =
    await evaluationManagementService.createNewEvaluationManagement(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Creating new Evaluation Management success",
    data: evaluationManagement,
  });
});

// ** update evaluationManagement
const updateEvaluationManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evaluationManagement =
    await evaluationManagementService.updateEvaluationManagement(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating Evaluation Management success",
    data: evaluationManagement,
  });
});

// ** get evaluationManagement by id
const deleteEvaluationManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const evaluationManagement =
    await evaluationManagementService.deleteEvaluationManagement(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Deleting Evaluation Management success",
    data: null,
  });
});

export const evaluationManagementController = {
  getAllEvaluationManagement,
  getSingleEvaluationManagement,
  createNewEvaluationManagement,
  updateEvaluationManagement,
  deleteEvaluationManagement,
};
