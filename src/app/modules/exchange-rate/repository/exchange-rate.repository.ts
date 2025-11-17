import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

class ExchangeRateRepository {
  constructor() {}
  async create(payload: Prisma.ExchangeRateCreateInput) {
    return prisma.exchangeRate.create({
      data: payload,
    });
  }

  // ** Updating the exchange rate
  async update<T extends Prisma.ExchangeRateUpdateArgs>(arg: T) {
    return prisma.exchangeRate.update(arg);
  }

  // ** Retrieve all exchange rate
  async findFirst<T extends Prisma.ExchangeRateFindFirstArgs>(args?: T) {
    return prisma.exchangeRate.findFirst(args);
  }

  // ** Retrieve single exchange rate by its id
  async findById<T extends Prisma.ExchangeRateFindUniqueArgs>(args: T) {
    return prisma.exchangeRate.findUnique(args);
  }
}

export const exchangeRepo = new ExchangeRateRepository();
