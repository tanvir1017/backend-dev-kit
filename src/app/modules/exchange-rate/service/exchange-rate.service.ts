import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";

import { ExchangeRate } from "@prisma/client";
import { TCountryCode } from "countries-list";
import { redisConfig } from "../../../../lib/redis/REDIS-CONSTANT";
import { redisCache } from "../../../../lib/redis/redis.utils";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { exchangeRepo } from "../repository/exchange-rate.repository";
import { T_CreateExchangeRateInput } from "../types/exchange-rate.types";

class ExchangeService {
  constructor() {}

  // ** Get the exchange rate
  async getExchangeRateService() {
    // redis layer
    const cacheKey = `ex_rate`;
    // Try to get from cache first
    // Or if clients want get the fresh data ~ fc => from cache
    // if (fc === "false") {
    //   await redisCache.del(cacheKey);
    // }

    try {
      const cachedResult = await redisCache.get<ExchangeRate>(cacheKey);

      if (cachedResult) {
        console.log("===🥕=== Cache hit for:", cacheKey);
        return cachedResult;
      }
    } catch (error) {
      console.error(
        "===👾=== Redis cache read error:",
        (error as Error).message,
      );
    }

    const result = await exchangeRepo.findFirst({});

    // Store in cache

    await cacheInRedis({
      data: result,
      key: cacheKey,
      ttl: redisConfig.TTL_FOR_X_RATE_LEVEL,
    });
  }

  // ** Get single exchange rate
  async getUniqueExchangeRate(id: string) {
    return await exchangeRepo.findById({
      where: {
        id,
      },
    });
  }

  // ** Create exchange rate
  async createExchangeRateService({
    payload,
    creator,
  }: {
    creator: I_GlobalJwtPayload;
    payload: T_CreateExchangeRateInput;
  }) {
    // ** check exchange is exist or not
    const isExchangeRateExist = await exchangeRepo.findFirst({});
    if (isExchangeRateExist) {
      throw new AppError(
        HttpStatusCode.NotAcceptable,
        "Exchange rate exists! Please update it instead of creating a new one!",
      );
    }
    // create the one. It will only be allowed for first time
    const createExRate = await exchangeRepo.create(payload);

    const cacheKey = `ex_rate`;
    await cacheInRedis({
      data: createExRate,
      key: cacheKey,
      ttl: redisConfig.TTL_FOR_X_RATE_LEVEL,
    });

    return createExRate;
  }

  // ** Create exchange rate
  async updateExchangeRateService({
    id,
    payload,
    auditor,
  }: {
    id: string;
    payload: { from?: TCountryCode; to?: TCountryCode; rate?: number };
    auditor: I_GlobalJwtPayload;
  }) {
    console.log(
      "🚀 ~ ExchangeService ~ updateExchangeRateService ~ payload:",
      payload,
    );
    // ** check exchange is exist or not
    const isExchangeRateExist = await exchangeRepo.findById({
      where: {
        id,
      },
    });

    if (!isExchangeRateExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Exchange rate does not exist!",
      );
    }

    if (!payload.from && !payload.to && !payload.rate) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Please provide at least one fields to update!",
      );
    }

    // create the one. It will only be allowed for first time
    const updateExchangeRate = await exchangeRepo.update({
      where: {
        id,
      },
      data: payload,
    });

    // update the cache
    const cacheKey = `ex_rate`;
    await cacheInRedis({
      data: updateExchangeRate,
      key: cacheKey,
      ttl: redisConfig.TTL_FOR_X_RATE_LEVEL,
    });

    return updateExchangeRate;
  }
}

async function cacheInRedis<T>({
  data,
  key,
  ttl,
}: {
  key: string;
  ttl: number;
  data: T;
}) {
  // update the cache
  try {
    await redisCache.set(key, data, ttl);
    console.log("===🌵=== Cache set for:", key);
  } catch (error) {
    console.error(
      "===🦠=== Redis cache write error:",
      (error as Error).message,
    );
  }
}

export const exchangeService = new ExchangeService();
