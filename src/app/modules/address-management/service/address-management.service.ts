import { Address } from "@prisma/client";
import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";
import AddressRepository from "../repository/address-management.repository";

class AddressService {
  private addressRepository: AddressRepository;

  constructor() {
    this.addressRepository = new AddressRepository();
  }

  //   // Get address by ID
  async getAddress({
    user,
    addressId,
  }: {
    user: any;
    addressId: string;
  }): Promise<Address> {
    const address = await this.addressRepository.getAddressById({
      whereClause: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      throw new AppError(HttpStatusCode.NotFound, "Address not found");
    }

    return address;
  }

  //   // Get user addresses with pagination
  //   async getUserAddresses({ user, userId, query }) {
  //     // Check if user has permission to access these addresses
  //     if (user.role !== "ADMIN" && user.id !== userId) {
  //       throw new AppError(
  //         HttpStatusCode.Forbidden,
  //         "Access denied to these addresses",
  //       );
  //     }

  //     const { limit, skip, page, sortBy, sortOrder } = calculatePagination(query);
  //     const { search, addressType } = query;

  //     const whereClause: Prisma.AddressWhereInput = {
  //       userId,
  //     };

  //     // Add search filter
  //     if (search) {
  //       whereClause.OR = [
  //         {
  //           country: {
  //             contains: search,
  //             mode: "insensitive" as Prisma.QueryMode,
  //           },
  //         },
  //         { city: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
  //         {
  //           street: { contains: search, mode: "insensitive" as Prisma.QueryMode },
  //         },
  //         {
  //           state: { contains: search, mode: "insensitive" as Prisma.QueryMode },
  //         },
  //       ];
  //     }

  //     // Add address type filter
  //     if (addressType) {
  //       whereClause.addressType = addressType;
  //     }

  //     const [totalItems, addresses] = await Promise.all([
  //       this.addressRepository.countUserAddresses({
  //         userId,
  //         where: whereClause,
  //       }),
  //       this.addressRepository.getUserAddresses({
  //         userId,
  //         skip,
  //         take: limit,
  //         where: whereClause,
  //         orderBy: { [sortBy]: sortOrder },
  //         select: {
  //           id: true,
  //           country: true,
  //           city: true,
  //           street: true,
  //           state: true,
  //           apartment: true,
  //           addressType: true,
  //           coordinates: true,
  //           isDefault: true,
  //           createdAt: true,
  //           updatedAt: true,
  //           userId: true,
  //         },
  //       }),
  //     ]);

  //     const totalPages = Math.ceil(totalItems / limit);

  //     return {
  //       meta: {
  //         limit,
  //         page,
  //         totalCount: totalItems,
  //         totalPages,
  //       },
  //       result: addresses,
  //     };
  //   }

  //   // Update address
  //   async updateAddress({ user, addressId, payload }) {
  //     // Check if address exists and user has permission
  //     const existingAddress = await this.addressRepository.getAddressById({
  //       addressId,
  //     });

  //     if (!existingAddress) {
  //       throw new AppError(HttpStatusCode.NotFound, "Address not found");
  //     }

  //     if (user.role !== "ADMIN" && existingAddress.userId !== user.id) {
  //       throw new AppError(
  //         HttpStatusCode.Forbidden,
  //         "Access denied to update this address",
  //       );
  //     }

  //     const updateData: Prisma.AddressUpdateInput = {};

  //     // Only update provided fields
  //     if (payload.country !== undefined) updateData.country = payload.country;
  //     if (payload.city !== undefined) updateData.city = payload.city;
  //     if (payload.street !== undefined) updateData.street = payload.street;
  //     if (payload.state !== undefined) updateData.state = payload.state;
  //     if (payload.apartment !== undefined)
  //       updateData.apartment = payload.apartment;
  //     if (payload.addressType !== undefined)
  //       updateData.addressType = payload.addressType;
  //     if (payload.coordinates !== undefined)
  //       updateData.coordinates = payload.coordinates as Prisma.InputJsonValue;
  //     if (payload.isDefault !== undefined)
  //       updateData.isDefault = payload.isDefault;

  //     return await this.addressRepository.updateAddress({
  //       addressId,
  //       data: updateData,
  //     });
  //   }

  //   // Delete address
  //   async deleteAddress({ user, addressId }) {
  //     // Check if address exists and user has permission
  //     const existingAddress = await this.addressRepository.getAddressById({
  //       addressId,
  //     });

  //     if (!existingAddress) {
  //       throw new AppError(HttpStatusCode.NotFound, "Address not found");
  //     }

  //     if (user.role !== "ADMIN" && existingAddress.userId !== user.id) {
  //       throw new AppError(
  //         HttpStatusCode.Forbidden,
  //         "Access denied to delete this address",
  //       );
  //     }

  //     return await this.addressRepository.deleteAddress(addressId);
  //   }

  //   // Set address as default
  //   async setDefaultAddress({ user, addressId }) {
  //     // Check if address exists and user has permission
  //     const existingAddress = await this.addressRepository.getAddressById({
  //       addressId,
  //     });

  //     if (!existingAddress) {
  //       throw new AppError(HttpStatusCode.NotFound, "Address not found");
  //     }

  //     if (user.role !== "ADMIN" && existingAddress.userId !== user.id) {
  //       throw new AppError(
  //         HttpStatusCode.Forbidden,
  //         "Access denied to modify this address",
  //       );
  //     }

  //     // Clear all default addresses for this user
  //     await this.addressRepository.clearDefaultAddresses(existingAddress.userId);

  //     // Set this address as default
  //     return await this.addressRepository.updateAddress({
  //       addressId,
  //       data: { isDefault: true },
  //     });
  //   }
}

export default AddressService;
