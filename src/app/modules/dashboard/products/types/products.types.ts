import { GoodTypes, Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { I_PaginationOptions } from "../../../../../lib/utils/calcPagination";
import { productValidation } from "../validation/products.validation";

export interface I_GetAllOrdersQuery extends I_PaginationOptions {
  productStatus?: ProductStatus;
  search?: string;
}

export interface I_GetAllCartProducts extends I_PaginationOptions {
  whereClause: Prisma.CartProductWhereInput;
  select?: Prisma.CartProductSelect;
  props?: Record<string, any>;
}

export interface I_CngProductStatusProps {
  productId: string;
  status: ProductStatus;
}

export interface I_QcDetailUpdate {
  length: number;
  width: number;
  height: number;
  weight: number;
  volume: number;
  cartProductId: string;
  typeOfGoods: GoodTypes;
  photos: string[];
}

export type T_QcDetails = z.infer<typeof productValidation.qcDetails>;
export type T_DeleteQcPhotos = {
  qcId: string;
  imageLink: string;
};
