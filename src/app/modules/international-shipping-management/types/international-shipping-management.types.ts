import { NormalOrHiddenStatus } from "@prisma/client";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";

export interface I_GetShippingProvidersQuery extends I_PaginationOptions {
  q?: string;
  nation?: string;
  status?: NormalOrHiddenStatus;
}
