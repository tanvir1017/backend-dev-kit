import { PromotionLevel } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

// ** get promotion levels
const getAllPromotionLevels = async (
  limit: number,
  skip: number,
  query?: Record<string, any>,
) => {
  return await prisma.promotionLevel.findMany({
    take: limit,
    skip,
    orderBy: {
      createdAt: "asc",
    },
  });
};

// ** create new promotion levels
const createNewPromotionalLevel = async (payload: PromotionLevel) => {
  return await prisma.promotionLevel.create({
    data: payload,
  });
};

// ** get promotion levels count
const getPromotionLevelsCount = async () => {
  return await prisma.promotionLevel.count();
};

// ** get single promotion level
const getPromotionLevelById = async (id: string) => {
  return await prisma.promotionLevel.findFirst({
    where: { id },
  });
};

// ** update promotion level from db
const updatePromotionLevel = async (
  id: string,
  payload: Partial<PromotionLevel>,
) => {
  return await prisma.promotionLevel.update({
    where: { id },
    data: payload,
  });
};

// ** delete promotion level
const deletePromotionLevelFromDb = async (id: string) => {
  return await prisma.promotionLevel.delete({
    where: { id },
  });
};

export const promotionLevelRepository = {
  getAllPromotionLevels,
  getPromotionLevelById,
  updatePromotionLevel,
  deletePromotionLevelFromDb,
  getPromotionLevelsCount,
  createNewPromotionalLevel,
};
