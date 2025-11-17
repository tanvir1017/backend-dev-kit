import { Prisma, PrismaClient } from "@prisma/client";
import prisma from "../../../../../lib/utils/prisma.utils";

class UserAccRepository {
  private prisma: PrismaClient | Prisma.TransactionClient;
  constructor() {
    this.prisma = prisma;
  }

  // Get all the product
  async getAllProductForUser<T extends Prisma.OrderFindManyArgs>({
    whereClause,
    include,
    select,
    limit,
    skip,
  }: T & {
    whereClause?: Prisma.OrderWhereInput;
    limit: number;
    skip: number;
  }) {
    return this.prisma.order.findMany({
      take: limit,
      skip,
      where: whereClause,
      ...(include && { include }),
      ...(select && { select }),
    }) as Promise<Prisma.OrderGetPayload<T>[] | []>;
  }

  // Create a package for shipping
  async createPackage(payload: Prisma.PackagesCreateInput, tx: typeof prisma) {
    return tx.packages.create({
      data: payload,
    });
  }

  //////////////////////////////////////////////////
  //  _> Parcel //////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getMyParcels<T extends Prisma.PackagesFindManyArgs>({ ...args }: T) {
    return prisma.packages.findMany({ ...args }) as Promise<
      Prisma.PackagesGetPayload<T>[] | []
    >;
  }
}

export default UserAccRepository;
