import {
  NormalOrHiddenStatus,
  ServiceAddonApplicablePhase,
} from "@prisma/client";
import { z } from "zod";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import { serviceManagementValidation } from "../validation/service-management.validation";

export type T_CreateServiceManagement = z.infer<
  typeof serviceManagementValidation.newServiceManagement
>["body"];

export type T_UpdateServiceManagement = z.infer<
  typeof serviceManagementValidation.updateServiceManagement
>["body"];

export interface I_ServiceManagementQuery extends I_PaginationOptions {
  status: NormalOrHiddenStatus;
  q?: string;
  phase?: ServiceAddonApplicablePhase;
}
