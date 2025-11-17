import { Prisma, ServiceManagement } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

// ** get all service management
const getAllServiceManagements = async <
  T extends Prisma.ServiceManagementFindManyArgs,
>(
  args: T,
) => {
  return await prisma.serviceManagement.findMany(args);
};
// ** get service management by id
const getSingleServiceManagement = async (id: string) => {
  return await prisma.serviceManagement.findUnique({
    where: { id, status: "NORMAL" },
  });
};
// ** get service management by ids
const getServiceManagement = async (id: string[]) => {
  return await prisma.serviceManagement.findMany({
    where: {
      id: {
        in: id,
      },
      status: "NORMAL",
    },
  });
};

// ** create service management
const createNewServiceManagement = async (payload: ServiceManagement) => {
  return await prisma.serviceManagement.create({
    data: payload,
  });
};

// ** update service management
const updateServiceManagement = async (
  id: string,
  payload: Partial<ServiceManagement>,
) => {
  return await prisma.serviceManagement.update({
    where: { id },
    data: payload,
  });
};

// ** get blog count
const getServiceManagementCount = async () => {
  return await prisma.serviceManagement.count();
};

// ** delete service management
const deleteServiceManagement = async (id: string) => {
  return await prisma.serviceManagement.delete({
    where: { id },
  });
};

export const serviceManagementRepository = {
  getAllServiceManagements,
  getServiceManagementCount,
  getSingleServiceManagement,
  createNewServiceManagement,
  updateServiceManagement,
  deleteServiceManagement,
  getServiceManagement,
};
