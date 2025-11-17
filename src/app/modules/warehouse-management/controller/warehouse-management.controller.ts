import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { wareHouseService } from "../service/warehouse-management.service";
import { T_updateStorage } from "../types/warehouse-management.types";

// ** get all warehouse
const getAllWarehouse = asyncHandler(async (req, res) => {
  const warehouses = await wareHouseService.getAllWarehouse(req.query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Warehouse created successfully",
    data: warehouses,
  });
});

// ** get single warehouse
const getSingleWarehouse = asyncHandler(async (req, res) => {
  const { name } = req.params;
  const warehouses = await wareHouseService.getSingleWarehouse(name);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single warehouse successfully",
    data: warehouses,
  });
});

// ** get single shelves by warehouse id
const getShelvesByWarehouseId = asyncHandler(async (req, res) => {
  const { warehouse_id } = req.params;
  const warehouses =
    await wareHouseService.getShelvesFromDbByWarehouseId(warehouse_id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Retrieved single shelves successfully",
    data: warehouses,
  });
});

// ** create new warehouse
const createNewWarehouse = asyncHandler(async (req, res) => {
  const wareHouseData = await wareHouseService.createNewWarehouse(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Warehouse created successfully",
    data: wareHouseData,
  });
});

// ** Get shelve's storage by its id
const getStorageByShelveId = asyncHandler(async (req, res) => {
  const { shelves_id } = req.params;
  const wareHouseData =
    await wareHouseService.getStorageFromDbByShelvesId(shelves_id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Warehouse created successfully",
    data: wareHouseData,
  });
});

///////////////////////////////////////////////////////////////////////////////
// _> Storage CRUD operations
///////////////////////////////////////////////////////////////////////////////

const getSingleStorageInfo = asyncHandler(async (req, res) => {
  const { storageId } = req.params;
  const storageData =
    await wareHouseService.getSingleStorageInfoFromDb(storageId);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Storage info retrieved successfully",
    data: storageData,
  });
});

const updateStorageInfo = asyncHandler(async (req, res) => {
  const { storageId } = req.params;
  const body = req.body as T_updateStorage;

  const storageData = await wareHouseService.updateStorage(storageId, body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Storage info updated successfully",
    data: storageData,
  });
});

export const wareHouseController = {
  createNewWarehouse,
  getAllWarehouse,
  getSingleWarehouse,

  // shelves and storage
  getShelvesByWarehouseId,
  getStorageByShelveId,

  // Storage CRUD
  getSingleStorageInfo,
  updateStorageInfo,
};
