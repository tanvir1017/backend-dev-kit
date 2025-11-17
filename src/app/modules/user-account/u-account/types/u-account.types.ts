import { PackageStatus } from "@prisma/client";
import { I_PaginationOptions } from "../../../../../lib/utils/calcPagination";

export type T_PackagePayload = {
  products: string[];
  addressId: string;
  shippingId: string;
  couponCodeId?: string;
  insurance?: string | boolean;
  remarks: string;
};

export interface I_GetMyParcelQuery extends I_PaginationOptions {
  q?: string;
  status?: PackageStatus;
}
