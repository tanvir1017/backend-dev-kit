import { Prisma, ServiceManagement } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { calculatePagination } from "../../../../lib/utils/calcPagination";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { globalRepository } from "../../global/repository/global.repository";
import { serviceManagementRepository } from "../repository/service-management.repository";
import { I_ServiceManagementQuery } from "../types/service-management.types";

// ** get all service management
const getAllServiceManagements = async (query: I_ServiceManagementQuery) => {
  const { status, q, phase, ...restPaginationOptions } = query;
  const { page, limit, skip, sortBy, sortOrder } = calculatePagination(
    restPaginationOptions,
  );

  // Build the where clause
  const whereClause: Prisma.ServiceManagementWhereInput = {
    ...(status && { status }),
    //...(phase && { applicablePhase: phase }),
    ...(q && {
      OR: [{ service: { contains: q, mode: Prisma.QueryMode.insensitive } }],
    }),
  };

  // get all service management
  const result = await serviceManagementRepository.getAllServiceManagements({
    where: whereClause,
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  // get total count of contact us with the same filters
  const totalCount = await globalRepository.getCollectionCount({
    modelName: "ServiceManagement",
    whereCondition: whereClause,
  });

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const paginationSchema: I_PaginationResponse<ServiceManagement[]> = {
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

// ** create new service Management
const createNewServiceManagement = async (payload: ServiceManagement) => {
  return await serviceManagementRepository.createNewServiceManagement(payload);
};

// ** delete new service Management
const deleteServiceManagement = async (id: string) => {
  const existedServiceManagement =
    await serviceManagementRepository.getSingleServiceManagement(id);

  if (!existedServiceManagement) {
    throw new AppError(HttpStatusCode.NotFound, "Service Management not found");
  }

  return await serviceManagementRepository.deleteServiceManagement(id);
}; // ** get single service management
const getSingleServiceManagement = async (id: string) => {
  const serviceManagement =
    await serviceManagementRepository.getSingleServiceManagement(id);

  if (!serviceManagement) {
    throw new AppError(HttpStatusCode.NotFound, "Service Management not found");
  }

  return serviceManagement;
}; // ** update new service Management
const updateServiceManagement = async (
  id: string,
  payload: Partial<ServiceManagement>,
) => {
  const existedServiceManagement =
    await serviceManagementRepository.getSingleServiceManagement(id);

  if (!existedServiceManagement) {
    throw new AppError(HttpStatusCode.NotFound, "Service Management not found");
  }

  return await serviceManagementRepository.updateServiceManagement(id, payload);
};

export const serviceManagementService = {
  getAllServiceManagements,
  getSingleServiceManagement,
  createNewServiceManagement,
  updateServiceManagement,
  deleteServiceManagement,
};
