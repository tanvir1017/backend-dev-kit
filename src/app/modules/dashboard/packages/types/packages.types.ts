import { PackageQcDetails, PackageStatus } from "@prisma/client";
import { I_PaginationOptions } from "../../../../../lib/utils/calcPagination";
import { T_PrismaModelOmittedProp } from "../../../../interface/common.interface";

export interface I_PackagesGetPayload extends I_PaginationOptions {
  q?: string;
  status?: PackageStatus;
}

export interface I_PackageQcDetailsPayload {
  pkgId: string;
  pkgQcDetails: Omit<PackageQcDetails, T_PrismaModelOmittedProp | "id">;
}
