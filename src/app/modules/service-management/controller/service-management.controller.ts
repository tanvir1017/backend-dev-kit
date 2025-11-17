import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { serviceManagementService } from "../service/service-management.service";
import { I_ServiceManagementQuery } from "../types/service-management.types";

// ** get all service management
const getAllServiceManagements = asyncHandler(async (req, res) => {
  const query = req.query as typeof req.query & I_ServiceManagementQuery;
  const serviceManagements =
    await serviceManagementService.getAllServiceManagements(query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all service management success",
    data: serviceManagements,
  });
});

// ** get single service management
const getSingleServiceManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceManagement =
    await serviceManagementService.getSingleServiceManagement(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single service management success",
    data: serviceManagement,
  });
});

// ** get single service management
const createServiceManagement = asyncHandler(async (req, res) => {
  const serviceManagement =
    await serviceManagementService.createNewServiceManagement(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Create service management success",
    data: serviceManagement,
  });
});

// ** update service management
const updateServiceManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceManagement =
    await serviceManagementService.updateServiceManagement(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Update service management success",
    data: serviceManagement,
  });
});

// ** delete service management
const deleteServiceManagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceManagement =
    await serviceManagementService.deleteServiceManagement(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Delete service management success",
    data: null,
  });
});

export const serviceManagementController = {
  getAllServiceManagements,
  getSingleServiceManagement,
  createServiceManagement,
  updateServiceManagement,
  deleteServiceManagement,
};
