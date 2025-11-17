import { PromotionLevel } from "@prisma/client";

import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { promotionLevelRepository } from "../repository/promotion-level.repository";

// ** get all promotion level
const getPromotionLevelFromDb = async (query?: Record<string, any>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = Number(page - 1) * limit || 0;

  // get total count of contact us
  const totalCount = await promotionLevelRepository.getPromotionLevelsCount();

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const result = await promotionLevelRepository.getAllPromotionLevels(
    limit,
    skip,
    query!,
  );

  const paginationSchema: I_PaginationResponse<PromotionLevel[]> = {
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

// ** create new promotional level
const createNewPromotionalLevel = async (payload: PromotionLevel) => {
  return await promotionLevelRepository.createNewPromotionalLevel(payload);
};

// ** get Promotion level by id
const getPromotionLevelById = async (id: string) => {
  const result = await promotionLevelRepository.getPromotionLevelById(id);

  if (!result) {
    throw new AppError(HttpStatusCode.NotFound, "Promotional level not found");
  }

  return result;
};

// ** delete Promotion level
const deletePromotionLevelFromDb = async (id: string) => {
  const result = await promotionLevelRepository.getPromotionLevelById(id);

  if (!result) {
    throw new AppError(HttpStatusCode.NotFound, "Promotional level not found");
  }

  const data = await promotionLevelRepository.deletePromotionLevelFromDb(id);

  return data;
};

// ** update Promotion level
const updatePromotionLevelFromDb = async (
  id: string,
  payload: Partial<PromotionLevel>,
) => {
  const result = await promotionLevelRepository.getPromotionLevelById(id);

  if (!result) {
    throw new AppError(HttpStatusCode.NotFound, "Promotional level not found");
  }

  const data = await promotionLevelRepository.updatePromotionLevel(id, payload);

  return data;
};

export const promotionLevelService = {
  getPromotionLevelFromDb,
  createNewPromotionalLevel,
  getPromotionLevelById,
  updatePromotionLevelFromDb,
  deletePromotionLevelFromDb,
};
