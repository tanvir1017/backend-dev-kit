import { Packages, Prisma } from "@prisma/client";
import prisma from "../../../../../lib/utils/prisma.utils";
import { T_PrismaModelOmittedProp } from "../../../../interface/common.interface";

class PackageRepo {
  constructor() {}

  // get the package qc details
  async getPackageByItsId<T extends Prisma.PackagesFindUniqueArgs>({
    ...args
  }: T) {
    return prisma.packages.findUnique({
      ...args,
    }) as Promise<Prisma.PackagesGetPayload<T> | null>;
  }

  // create a Package to db
  async createPackage(
    payload: Omit<
      Packages,
      | T_PrismaModelOmittedProp
      | "paymentId"
      | "couponId"
      | "insuranceId"
      | "trackingNo"
      | "trackingLink"
      | "typeOfGoods"
      | "paId"
      | "wsId"
    >,
    tx: typeof prisma | Prisma.TransactionClient = prisma,
  ) {
    return tx.packages.create({
      data: payload,
    });
  }

  // Update package to db
  async updatePackage({
    payload,
    id,
    tx = prisma,
  }: {
    payload: Prisma.PackagesUpdateInput;
    id: string;
    tx?: typeof prisma | Prisma.TransactionClient;
  }) {
    return tx.packages.update({
      where: {
        id,
      },
      data: payload,
    });
  }

  // Get the package for the dashboard user of warehouse stuff
  async getThePackages<T extends Prisma.PackagesDefaultArgs>({
    include,
    omit,
    select,
    whereClause,
    skip,
    take,
  }: T & {
    skip: number;
    take: number;
    whereClause?: Prisma.PackagesWhereInput;
  }) {
    return prisma.packages.findMany({
      take,
      skip,
      where: {
        ...whereClause,
      },

      ...(include && { include }),
      ...(select && { select }),
      ...(omit && { omit }),
    }) as Promise<Prisma.PackagesGetPayload<T>[] | []>;
  }

  ////////////////////////////////////////////////
  // _> Package qc details
  ////////////////////////////////////////////////

  // update the package qc details
  async createPackageQcDetailsIntoDB(
    payload: Prisma.PackageQcDetailsCreateInput,
  ) {
    return prisma.packageQcDetails.create({
      data: payload,
    });
  }

  // update the package qc details
  async updatePackageQcDetailsIntoDB({
    pkgId,
    payload,
  }: {
    pkgId: string;
    payload: Prisma.PackageQcDetailsUpdateInput;
  }) {
    return prisma.packageQcDetails.update({
      where: {
        id: pkgId,
      },
      data: payload,
    });
  }
}

export default PackageRepo;
