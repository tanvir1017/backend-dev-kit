import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import {
  I_ContactUsQuery,
  T_NewContactUs,
  T_UpdateContactUs,
} from "../types/contact-us.types";

// ** create new contact us
const creteContactUs = async (payload: T_NewContactUs) => {
  return await prisma.contactUs.create({
    data: payload,
  });
};

// ** get contact us
const getPaginatedContactUs = async (
  limit: number,
  skip: number,
  query: Pick<I_ContactUsQuery, "q" | "status">,
) => {
  const result = await prisma.contactUs.findMany({
    take: limit,
    skip,
    where: {
      ...(query?.q && {
        searchText: {
          contains: query.q,
          mode: "insensitive" as Prisma.QueryMode,
        },
      }),
      ...(query?.status && {
        status: {
          equals: query.status,
        },
      }),
    },
    orderBy: {
      cratedAt: "desc",
    },
  });

  return result;
};

// ** search contact us
const searchContactUs = async (
  limit: number,
  skip: number,
  query: Record<string, any>,
  searchQuery: string,
) => {
  return await prisma.contactUs.findMany({
    take: limit,
    skip,
    where: {
      OR: [
        {
          message: { contains: searchQuery, mode: "insensitive" },
        },
      ],
    },
  });
};

// ** get contact us by id
const getContactUsById = async (id: string) => {
  return await prisma.contactUs.findFirst({
    where: { id },
  });
};

// ** get contact us count
const getContactUsCount = async () => {
  return await prisma.contactUs.count();
};

// ** update contact us status
const updateContactUsStatus = async (id: string, status: T_UpdateContactUs) => {
  return await prisma.contactUs.update({
    where: { id },
    data: {
      status: status as any,
    },
  });
};

// ** delete contact us status
const deleteContactUs = async (id: string) => {
  return await prisma.contactUs.delete({
    where: { id },
  });
};

export const contactUsRepository = {
  getPaginatedContactUs,
  getContactUsCount,
  creteContactUs,
  searchContactUs,
  getContactUsById,
  updateContactUsStatus,
  deleteContactUs,
};
