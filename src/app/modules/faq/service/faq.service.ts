import { faqRepository } from "../repository/faq.repository";

import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";
import { T_CreateFAQ, T_UpdateFAQ } from "../types/faq.types";

// ** get all faq
const getAllFAQ = async (query?: Record<string, any>) => {
  return await faqRepository.getAllFAQ();
};

// ** get single faq
const getSingleFAQ = async (id: string) => {
  const faq = await faqRepository.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  return faq;
};

// ** create FAQ
const createFAQ = async (payload: T_CreateFAQ) => {
  return await faqRepository.createFAQ(payload);
};

// ** update faq
const updateFAQ = async (id: string, payload: T_UpdateFAQ) => {
  const faq = await faqRepository.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  return await faqRepository.updateFAQ(id, payload);
};

// ** delete faq
const deleteFAQ = async (id: string) => {
  const faq = await faqRepository.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  return await faqRepository.deleteFAQ(id);
};

export const faqService = {
  getAllFAQ,
  getSingleFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
