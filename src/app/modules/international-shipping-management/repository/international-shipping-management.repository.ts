import { Prisma, ShippingProvider } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

class ShippingProviderRepository {
  async create(data: Prisma.ShippingProviderCreateInput) {
    return await prisma.shippingProvider.create({ data });
  }

  async findAll(queryPayload: Prisma.ShippingProviderFindManyArgs) {
    return (await prisma.shippingProvider.findMany({
      ...queryPayload,
    })) as Prisma.ShippingProviderGetPayload<Prisma.ShippingProviderFindManyArgs>[];
  }

  async findById<T extends Prisma.ShippingProviderDefaultArgs>(
    payload: T & { id: string },
  ) {
    const { id, ...rest } = payload;
    return await prisma.shippingProvider.findUnique({
      where: { id },
      ...rest,
    });
  }

  async update(id: string, data: Partial<ShippingProvider>) {
    return await prisma.shippingProvider.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await prisma.shippingProvider.delete({
      where: { id },
    });
  }
}

export default ShippingProviderRepository;
