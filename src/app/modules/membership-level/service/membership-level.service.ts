import { MemberShipLevel, Prisma } from "@prisma/client";
import { HttpStatusCode } from "axios";

import { redisConfig } from "../../../../lib/redis/REDIS-CONSTANT";

import { redisHelper } from "../../../../lib/redis/cache-helper";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { globalRepository } from "../../global/repository/global.repository";
import { membershipLevelRepository } from "../repository/membership-level.repository";
import { T_MembershipLevel } from "../types/membership-level.types";

// ** get all membership levels
const getAllMembershipLevels = async (
  query: I_PaginationOptions,
): Promise<I_PaginationResponse<MemberShipLevel[]> | undefined> => {
  const { fc = "true", ...rest } = query;
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(rest);

  // redis layer
  const cacheKey = `m_level:page:${page}:limit:${limit}`;
  // Revalidate if requested
  if (fc === "false") {
    await redisHelper.safeDel(cacheKey);
  }

  // Try to get from cache first
  const cb = async () => {
    // get total count of membership levels and the page data
    const [result, totalCount] = await Promise.all([
      membershipLevelRepository.getAllMembershipLevels({
        take: limit,
        skip,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      globalRepository.getCollectionCount({
        modelName: "MemberShipLevel",
        whereCondition: {},
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: { totalCount, totalPages, page, limit },
      result,
    };
  };

  // Use getOrSet helper which centralizes try/catch and set logic
  const paginationSchema = await redisHelper.getOrSet(
    cacheKey,
    redisConfig.TTL_FOR_M_LEVEL,
    cb,
  );

  return paginationSchema;
};

// ** create new membership level
const createNewMembershipLevel = async (payload: T_MembershipLevel) => {
  const response = await membershipLevelRepository.createNewMembershipLevel({
    ...payload,
  });

  const cacheKey = `m_level:page:1:limit:10`;
  await redisHelper.safeDel(cacheKey);
  console.log("===🌵=== Cache cleared for:", `${cacheKey}`);
  return response;
};

// ** Get users member ship level
const getUserMembershipLevel = async (
  query: I_PaginationOptions & { q?: string },
): Promise<I_PaginationResponse<Prisma.UserGetPayload<any>[]>> => {
  const { q, ...rest } = query;
  const { limit, page, skip, sortBy, sortOrder } = calculatePagination(rest);

  let whereClause: Prisma.UserWhereInput = {};

  if (q) {
    whereClause.OR = [
      {
        email: {
          contains: q,
          mode: "insensitive",
        },
        profile: {
          fullName: {
            contains: q,
            mode: "insensitive",
          },
        },
      },
    ];
  }
  // redis layer
  const searchQ = q ? `:q:${q}` : "";
  const cacheKey = `m_level:page:${page}:limit:${limit}${searchQ}`;
  // Try to get from cache first
  // Or if clients want get the fresh data ~ fc => from cache
  if (query.fc === "false") {
    await redisHelper.safeDel(cacheKey);
  }

  const cachedResult2 =
    await redisHelper.safeGet<
      I_PaginationResponse<Prisma.UserGetPayload<any>[]>
    >(cacheKey);
  if (cachedResult2) {
    console.log("===🥕=== Cache hit for:", cacheKey);
    return cachedResult2;
  }

  // if redis cache is failed then read from database
  const [response, totalCount] = await Promise.all([
    await membershipLevelRepository.getUsersMembershipLevel({
      where: whereClause,
      take: limit,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    globalRepository.getCollectionCount({
      modelName: "User",
      whereCondition: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const responseWithMeta = {
    meta: {
      totalCount,
      totalPages,
      page,
      limit,
    },
    result: response,
  };
  // Set to the redis

  await redisHelper.safeSet(
    cacheKey,
    responseWithMeta,
    redisConfig.TTL_FOR_U_M_LEVEL,
  );
  console.log("===🌵=== Cache set for:", cacheKey);

  return responseWithMeta;
};

// ** delete membership level
const deleteMembershipLevel = async (id: string) => {
  const blogExist =
    await membershipLevelRepository.getSingleMembershipLevel(id);

  if (!blogExist) {
    throw new AppError(HttpStatusCode.NotFound, "Membership level not found");
  }

  return await membershipLevelRepository.deleteMembershipLevel(id);
};

export const membershipService = {
  getAllMembershipLevels,
  //getSingleMembershipLevel,
  createNewMembershipLevel,
  //updateMembershipLevel,
  deleteMembershipLevel,
  getUserMembershipLevel,
};
