import { Bulletin } from "@prisma/client";
import { HttpStatusCode } from "axios";

import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { bulletinRepository } from "../repository/bulletin.repository";

// ** getAll bulletin
const getAllBulletin = async (query?: Record<string, any>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = Number(page - 1) * limit || 0;

  // get total count of contact us
  const totalCount = await bulletinRepository.getBulletinCount();

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const result = await bulletinRepository.getAllBulletin(limit, skip, query!);

  const paginationSchema: I_PaginationResponse<Bulletin[]> = {
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

// ** get bulletin by id
const getSingleBulletin = async (id: string) => {
  const bulletin = await bulletinRepository.getSingleBulletin(id);

  if (!bulletin) {
    throw new AppError(HttpStatusCode.NotFound, "Bulletin not found");
  }

  return bulletin;
};

// ** create new bulletin
const createNewBulletin = async (payload: Bulletin) => {
  const eventData = new Date(payload.date);

  if (eventData < new Date()) {
    throw new AppError(
      HttpStatusCode.NotAcceptable,
      "Event date must be in future",
    );
  }

  const bulletin = await bulletinRepository.createNewBulletin(payload);

  return bulletin;
};

// ** create new bulletin
const updateBulletin = async (id: string, payload: Partial<Bulletin>) => {
  const bulletinExist = await bulletinRepository.getSingleBulletin(id);

  if (!bulletinExist) {
    throw new AppError(HttpStatusCode.NotFound, "Bulletin not found");
  }

  let newEventData;
  if (payload.date) {
    const eventData = new Date(payload.date);
    newEventData = eventData;
  }

  if (newEventData && newEventData < new Date()) {
    throw new AppError(
      HttpStatusCode.NotAcceptable,
      "Event date must be in future",
    );
  }

  const bulletin = await bulletinRepository.updateBulletin(id, payload);

  return bulletin;
};

// ** delete bulletin
const deleteBulletin = async (id: string) => {
  const bulletinExist = await bulletinRepository.getSingleBulletin(id);

  if (!bulletinExist) {
    throw new AppError(HttpStatusCode.NotFound, "Bulletin not found");
  }

  return await bulletinRepository.deleteBulletin(id);
};

export const bulletinService = {
  getAllBulletin,
  getSingleBulletin,
  updateBulletin,
  createNewBulletin,
  deleteBulletin,
};
