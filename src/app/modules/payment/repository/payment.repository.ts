import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";
import { T_PrismaModelOmittedProp } from "../../../interface/common.interface";

export const paymentRepository = {
  // Create payment record
  async createPaymentRecord({
    payload,
    tx = prisma,
  }: {
    payload: Omit<Prisma.PaymentCreateInput, T_PrismaModelOmittedProp>;
    tx?: Prisma.TransactionClient;
  }) {
    return await tx.payment.create({
      data: payload,
    });
  },

  async getPaymentListByOrderId<
    T extends {
      includes?: Prisma.PaymentInclude;
      select?: Prisma.PaymentSelect;
    },
  >({
    whereClause,
    includes,
    select,
    limit,
    skip,
  }: T & {
    whereClause: Prisma.PaymentWhereInput;
    limit: number;
    skip: number;
  }) {
    return prisma.payment.findMany({
      take: limit,
      skip,
      where: whereClause,
      ...(includes && { include: includes }),
      ...(select && { select }),
    }) as Promise<Prisma.PaymentGetPayload<T>[]>;
  },
};
