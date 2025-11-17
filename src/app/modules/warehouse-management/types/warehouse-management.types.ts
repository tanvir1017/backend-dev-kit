import { Shelf, Storage, Warehouse } from "@prisma/client";
import { z } from "zod";
import { wareHouseValidation } from "../validation/warehouse-management.validation";

export type T_NewWarehouse = Omit<Warehouse, "createdAt" | "updatedAt" | "id">;

export type T_NewWareHouseBody = z.infer<
  typeof wareHouseValidation.newWarehouseSchema
>["body"];

export type T_UpdateWareHouseBody = z.infer<
  typeof wareHouseValidation.newWarehouseSchema
>["body"];

export type T_WareHouseBody = z.infer<
  typeof wareHouseValidation.newWarehouseSchema
>;

export type T_updateStorage = z.infer<
  typeof wareHouseValidation.updateStorageSchema
>["body"];

export type T_UpdateWarehouse = Partial<
  Omit<Warehouse, "createdAt" | "updatedAt" | "id">
>;

export type T_NewSelf = Omit<Shelf, "id">;
export type T_NewStorage = Omit<Storage, "id">;
