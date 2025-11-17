import { Bulletin } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

// ** get all bulletin
const getAllBulletin = async (
  limit: number,
  skip: number,
  query?: Record<string, any>,
) => {
  return await prisma.bulletin.findMany({
    take: limit,
    skip,
  });
};

// ** get bulletin by id
const getSingleBulletin = async (id: string) => {
  return await prisma.bulletin.findFirst({
    where: { id },
  });
};

// ** create new bulletin
const createNewBulletin = async (payload: Bulletin) => {
  return await prisma.bulletin.create({
    data: payload,
  });
};

// ** update bulletin
const updateBulletin = async (id: string, payload: Partial<Bulletin>) => {
  return await prisma.bulletin.update({
    where: { id },
    data: payload,
  });
};

// ** delete bulletin
const deleteBulletin = async (id: string) => {
  return await prisma.bulletin.delete({
    where: { id },
  });
};

// ** get bulletin count
const getBulletinCount = async () => {
  return await prisma.bulletin.count();
};

export const bulletinRepository = {
  getAllBulletin,
  getBulletinCount,
  getSingleBulletin,
  createNewBulletin,
  updateBulletin,
  deleteBulletin,
};
