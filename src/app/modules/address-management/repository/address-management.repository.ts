import { Address, Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

class AddressRepository {
  // Create new address
  async createAddress(data: Prisma.AddressCreateInput): Promise<Address> {
    return await prisma.address.create({
      data,
    });
  }

  // Get address by ID
  async getAddressById<T extends Prisma.AddressDefaultArgs>({
    include,
    select,
    whereClause,
  }: T & { whereClause: Prisma.AddressWhereUniqueInput }) {
    const result = prisma.address.findUnique({
      where: whereClause,
      ...(include && { include }),
      ...(select && { select }),
    }) as Prisma.Prisma__AddressClient<Prisma.AddressGetPayload<T>>;
    return result;
  }

  // Get addresses by user ID with pagination
  async getUserAddresses({
    userId,
    skip,
    take,
    where,
    select,
    orderBy = { createdAt: "desc" },
  }: {
    userId: string;
    skip: number;
    take: number;
    where?: Prisma.AddressWhereInput;
    select?: Prisma.AddressSelect;
    orderBy?: Prisma.AddressOrderByWithRelationInput;
  }): Promise<Address[]> {
    return await prisma.address.findMany({
      where: {
        userId,
        ...where,
      },
      skip,
      take,
      orderBy,
      select,
    });
  }

  // Count user addresses
  async countUserAddresses({
    userId,
    where,
  }: {
    userId: string;
    where?: Prisma.AddressWhereInput;
  }): Promise<number> {
    return await prisma.address.count({
      where: {
        userId,
        ...where,
      },
    });
  }

  // Update address
  async updateAddress({
    addressId,
    data,
    select,
  }: {
    addressId: string;
    data: Prisma.AddressUpdateInput;
    select?: Prisma.AddressSelect;
  }): Promise<Address> {
    return await prisma.address.update({
      where: { id: addressId },
      data,
      select,
    });
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<Address> {
    return await prisma.address.delete({
      where: { id: addressId },
    });
  }

  // Set all addresses as non-default for a user
  async clearDefaultAddresses(userId: string): Promise<void> {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Get default address for user
  async getDefaultAddress(userId: string): Promise<Address | null> {
    return await prisma.address.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  // Check if address belongs to user
  async isAddressOwnedByUser(
    addressId: string,
    userId: string,
  ): Promise<boolean> {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId,
      },
    });
    return !!address;
  }
}

export default AddressRepository;
