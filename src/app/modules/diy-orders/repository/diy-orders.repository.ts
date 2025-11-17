import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

class DiyOrderRepo {
  constructor() {}

  // Get all DIY orders with flexible query
  async getAllDiyOrders<T extends Prisma.DiyOrdersFindManyArgs>(payload: T) {
    return prisma.diyOrders.findMany(payload) as Promise<
      Prisma.DiyOrdersGetPayload<T>[]
    >;
  }

  // Get DIY orders for individual user
  async getAllDiyOrdersByUserId<T extends Prisma.DiyOrdersFindManyArgs>(
    payload: T & { userId: string },
  ) {
    const { userId, ...rest } = payload;
    return prisma.diyOrders.findMany({
      where: {
        userId: userId,
        ...rest.where,
      },
      ...rest,
    }) as Promise<Prisma.DiyOrdersGetPayload<T>[]>;
  }

  // Get single DIY order by ID
  async getSingleDiyOrder<T extends Prisma.DiyOrdersFindFirstArgs>(payload: T) {
    return prisma.diyOrders.findFirst(
      payload,
    ) as Promise<Prisma.DiyOrdersFindFirstArgs<any> | null>;
  }

  // Create DIY order
  async createDiyOrder<T extends Prisma.DiyOrdersCreateArgs>(payload: T) {
    return prisma.diyOrders.create(payload);
  }

  // Update DIY order
  async updateDiyOrder<T extends Prisma.DiyOrdersUpdateArgs>(payload: T) {
    return prisma.diyOrders.update(payload);
  }

  // Delete DIY order
  async deleteDiyOrder<T extends Prisma.DiyOrdersDeleteArgs>(payload: T) {
    return prisma.diyOrders.delete(payload);
  }
}

export const diyOrderRepo = new DiyOrderRepo();
