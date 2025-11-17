import { HttpStatusCode } from "axios";

import { NormalOrHiddenStatus } from "@prisma/client";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { warehouseRepository } from "../repository/warehouse-management.repository";
import {
  T_NewWareHouseBody,
  T_updateStorage,
} from "../types/warehouse-management.types";

// ** get all warehouse
const getAllWarehouse = async (query: I_PaginationOptions) => {
  const { page, limit, skip } = calculatePagination(query);

  // get total count of contact us
  const [totalCount, warehouses] = await Promise.all([
    warehouseRepository.getWareHouseCount(),
    warehouseRepository.getAllWarehouse(limit, skip),
  ]);

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  // map into clean shape
  const result = warehouses.map((w) => ({
    id: w.id,
    name: w.name,
    status: w.status,
    numberOfShelves: w.shelves.length,
    storagePerShelf: w.shelves[0]?._count?.storages || 0,
  }));

  const paginationSchema: I_PaginationResponse<typeof result> = {
    meta: {
      totalCount,
      totalPages,
      page,
      limit,
    },
    result,
  };

  return paginationSchema;
};

// ** get single warehouse
const getSingleWarehouse = async (name: string) => {
  const warehouse = await warehouseRepository.getSingleWarehouse(name);

  if (!warehouse) {
    throw new AppError(HttpStatusCode.NotFound, "No ware house found");
  }
  return warehouse;
};

// ** create new warehouse
const createNewWarehouse = async (payload: T_NewWareHouseBody) => {
  const warehouseExist = await warehouseRepository.getSingleWarehouse(
    payload.name,
  );

  if (warehouseExist) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "Warehouse with this name already exist",
    );
  }

  // 1. Create warehouse
  const warehouse = await warehouseRepository.createNewWarehouse({
    name: payload.name,
    status: payload.status as NormalOrHiddenStatus,
  });

  // 2. Create shelves (bulk insert)
  const shelvesData = Array.from({ length: payload.numberOfShelves }).map(
    () => ({
      status: payload.status as NormalOrHiddenStatus,
      warehouseId: warehouse.id,
    }),
  );

  await warehouseRepository.createShelves(shelvesData);

  // 3. Fetch shelves with their IDs
  const shelves = await warehouseRepository.getShelvesByWarehouseId(
    warehouse.id,
  );

  // 4. Create storages for each shelf
  for (const shelf of shelves) {
    const storagesData = Array.from({
      length: payload.storagePerShelf,
    }).map(() => ({
      status: payload.status as NormalOrHiddenStatus,
      shelfId: shelf.id,
      isFree: true,
    }));

    await warehouseRepository.createStorages(storagesData);
  }

  return { warehouse, shelves };
};

// ** update Storage status
const updateStorage = async (id: string, payload: T_updateStorage) => {
  const storageExist = await warehouseRepository.getSingleStorage(id);
  if (!storageExist) {
    throw new AppError(HttpStatusCode.NotFound, "Storage not found");
  }

  // If the body is empty, throw an error
  if (Object.keys(payload).length === 0) {
    throw new AppError(
      HttpStatusCode.BadRequest,
      "No data provided for update",
    );
  }

  const newPayload = {
    isFree: payload.isFree || storageExist.isFree,
    status: payload.status
      ? (payload.status as NormalOrHiddenStatus)
      : storageExist.status,
  };
  return await warehouseRepository.updateStorage(id, newPayload);
};
const getShelvesFromDbByWarehouseId = async (warehouse_id: string) => {
  return await warehouseRepository.getShelvesByWarehouseId(warehouse_id);
};

// get storage by its shelves id
const getStorageFromDbByShelvesId = async (shelves_id: string) => {
  return await warehouseRepository.getStorageByItsShelvesId(shelves_id);
};

// ** get single storage info by its id
const getSingleStorageInfoFromDb = async (storageId: string) => {
  const storage = await warehouseRepository.getSingleStorage(storageId);

  if (!storage) {
    throw new AppError(HttpStatusCode.NotFound, "No storage found");
  }

  return storage;
};
export const wareHouseService = {
  createNewWarehouse,
  getAllWarehouse,
  getSingleWarehouse,
  updateStorage,

  // Storage and shelves
  getShelvesFromDbByWarehouseId,
  getStorageFromDbByShelvesId,
  getSingleStorageInfoFromDb,
};
