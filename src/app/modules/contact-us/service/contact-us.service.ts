import { ContactUs } from "@prisma/client";

import { HttpStatusCode } from "axios";
import { CountryCode } from "libphonenumber-js";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import { validatePhoneNumber } from "../../../../lib/utils/libphonenumber";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { globalRepository } from "../../global/repository/global.repository";
import { contactUsRepository } from "../repository/contact-us.repository";
import {
  I_ContactUsQuery,
  T_NewContactUs,
  T_UpdateContactUs,
} from "../types/contact-us.types";

// ** retrieve all contact us from db
const getContactUsFromDb = async (query: I_ContactUsQuery) => {
  const { q, status, ...rest } = query;
  const { limit, skip, page } = calculatePagination(rest);
  // parallelly get the total count of orders by promise.all
  const [result, totalCount] = await Promise.all([
    contactUsRepository.getPaginatedContactUs(limit, skip, {
      q,
      status,
    }),
    contactUsRepository.getContactUsCount(),
  ]);

  // calculate total page for pagination
  let totalPages = Math.ceil(totalCount / limit);
  totalPages = totalPages <= 0 ? 1 : totalPages;

  const paginationSchema: I_PaginationResponse<ContactUs[]> = {
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

// ** retrieve all contact us from db
const searchContactUsFromDb = async (
  searchQuery: string,
  query: I_PaginationOptions,
): Promise<I_PaginationResponse<ContactUs[]>> => {
  const { limit, skip, page } = calculatePagination(query);

  // get total count of contact us
  const [result, totalCount] = await Promise.all([
    contactUsRepository.searchContactUs(limit, skip, query!, searchQuery),
    globalRepository.getCollectionCount({
      modelName: "ContactUs",
      whereCondition: {},
    }),
  ]);

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const paginationSchema = {
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

// ** insert new const us into db
const creteContactUs = async (payload: T_NewContactUs) => {
  const validPhoneNumber = validatePhoneNumber(
    payload.phoneNumber,
    payload.phoneCountryCode,
  );

  const { ...copiedPayload } = payload;

  copiedPayload.phoneNumber = validPhoneNumber.formatted as string;
  const searchText = `${copiedPayload.fullName} ${copiedPayload.email} ${copiedPayload.phoneNumber}`;

  copiedPayload.phoneCountryCode = validPhoneNumber.country as CountryCode;
  copiedPayload.searchText = searchText;

  return await contactUsRepository.creteContactUs(copiedPayload);
};

// ** get contact us by id from db
const getContactUsById = async (id: string) => {
  const result = await contactUsRepository.getContactUsById(id);

  if (!result) {
    throw new AppError(HttpStatusCode.NotFound, "Contact us not found");
  }

  return result;
};

// ** update contact us status
const updateContactUsStatus = async (id: string, status: T_UpdateContactUs) => {
  const contactUs = await contactUsRepository.getContactUsById(id);
  if (!contactUs) {
    throw new AppError(HttpStatusCode.NotFound, "Contact us not found");
  }

  const result = await contactUsRepository.updateContactUsStatus(id, status);

  return result;
};

// ** delete contact us
const deleteContactUs = async (id: string) => {
  const contactUs = await contactUsRepository.getContactUsById(id);
  if (!contactUs) {
    throw new AppError(HttpStatusCode.NotFound, "Contact us not found");
  }

  const result = await contactUsRepository.deleteContactUs(id);

  return result;
};

export const contactUsService = {
  getContactUsFromDb,
  creteContactUs,
  searchContactUsFromDb,
  getContactUsById,
  updateContactUsStatus,
  deleteContactUs,
};
