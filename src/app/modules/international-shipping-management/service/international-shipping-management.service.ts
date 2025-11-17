import { Prisma, ShippingProvider } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { calculatePagination } from "../../../../lib/utils/calcPagination";
import { buildSearchOR } from "../../../../queryEngine/QueryBuilder";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import GlobalRepository from "../../global/repository/global.repository";
import ShippingProviderRepository from "../repository/international-shipping-management.repository";
import { I_GetShippingProvidersQuery } from "../types/international-shipping-management.types";

class ShippingProviderService {
  private repo: ShippingProviderRepository;
  private globalRepo: GlobalRepository;

  constructor() {
    this.repo = new ShippingProviderRepository();
    this.globalRepo = new GlobalRepository();
  }

  async createProvider(payload: ShippingProvider) {
    const exists = await this.repo.findAll({ where: { code: payload.code } });
    if (exists.length > 0) {
      throw new AppError(
        HttpStatusCode.Conflict,
        "Provider code already exists!",
      );
    }
    return await this.repo.create(payload);
  }

  async getAllProviders(
    query: I_GetShippingProvidersQuery,
  ): Promise<I_PaginationResponse<ShippingProvider[]>> {
    const { nation, q, status, ...rest } = query;

    // Pagination
    const { limit, skip, page } = calculatePagination(rest);

    // Build the dynamic filter
    const whereClause: Prisma.ShippingProviderWhereInput = {};

    if (nation) {
      whereClause.nation = nation;
    }

    if (status) {
      whereClause.status = status;
    }

    if (q) {
      // Create an OR condition to match multiple fields
      if (q) {
        whereClause.OR = buildSearchOR<Prisma.ShippingProviderWhereInput>(
          ["billingType", "code", "name", "description"],
          q,
        );
      }
    }

    // Fetch data and total count in parallel
    const [providers, totalCount] = await Promise.all([
      this.repo.findAll({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
      }),

      this.globalRepo.getCollectionCount({
        modelName: "ShippingProvider",
        whereCondition: whereClause,
      }),
    ]);

    // Pagination meta
    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: {
        limit,
        page,
        totalCount,
        totalPages,
      },
      result: providers,
    };
  }

  // async getProviderById(id: string) {
  //   const provider = await this.repo.findById(id);
  //   if (!provider)
  //     throw new AppError(
  //       HttpStatusCode.NotFound,
  //       "Shipping provider not found!",
  //     );
  //   return provider;
  // }

  // async updateProvider(id: string, data: Partial<ShippingProvider>) {
  //   const provider = await this.repo.findById(id);
  //   if (!provider)
  //     throw new AppError(
  //       HttpStatusCode.NotFound,
  //       "Shipping provider not found!",
  //     );
  //   return await this.repo.update(id, data);
  // }

  // async deleteProvider(id: string) {
  //   const provider = await this.repo.findById(id);
  //   if (!provider)
  //     throw new AppError(
  //       HttpStatusCode.NotFound,
  //       "Shipping provider not found!",
  //     );
  //   return await this.repo.delete(id);
  // }
}

export default ShippingProviderService;
