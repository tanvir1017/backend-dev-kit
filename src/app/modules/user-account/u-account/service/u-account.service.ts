import { PackageStatus, Prisma, ProductStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { redisConfig } from "../../../../../lib/redis/REDIS-CONSTANT";
import { redisCache } from "../../../../../lib/redis/redis.utils";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../../lib/utils/calcPagination";
import AppError from "../../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../../interface/common.interface";
import OrderRepository from "../../../dashboard/products/repository/products.repository";
import GlobalRepository from "../../../global/repository/global.repository";
import UserAccRepository from "../repository/u-account.repository";
import { I_GetMyParcelQuery, T_PackagePayload } from "../types/u-account.types";

class UserAccService {
  private userAccRepository: UserAccRepository;
  private globalRepository: GlobalRepository;
  private orderRepository: OrderRepository;
  constructor() {
    this.userAccRepository = new UserAccRepository();
    this.globalRepository = new GlobalRepository();
    this.orderRepository = new OrderRepository();
  }

  // Create a package and checkout session
  async createPackage({
    packagePayload,
    user,
  }: {
    packagePayload: T_PackagePayload;
    user: I_GlobalJwtPayload;
  }) {
    // check the product is for this user or not

    // check the product is valid or not
    const isValidProducts = this.orderRepository.getProductByIds({
      productIds: packagePayload.products,
      userId: user.id,
    });

    if (!isValidProducts) {
      throw new AppError(HttpStatusCode.NotFound, "Products not found!");
    }

    // check is the address valid or not
    //return the stripe checkout link and session id
  }

  async getAllProductForUser(payload: {
    paginationQuery: I_PaginationOptions;
    q?: string;
    status?: ProductStatus;
  }): Promise<I_PaginationResponse<any>> {
    // pagination calculations
    const { limit, page, skip } = calculatePagination(payload.paginationQuery);

    let whereClause: Prisma.OrderWhereInput = {};

    // If there is any status to be filter
    if (payload.status) {
      whereClause = {
        productStatus: payload.status,
      };
    }

    // If there is any search text
    if (payload.q) {
      whereClause.OR = [
        {
          carts: {
            some: {
              title: {
                contains: payload.q,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const [products, totalItems] = await Promise.all([
      this.userAccRepository.getAllProductForUser({
        whereClause: whereClause,
        limit,
        skip,
        include: {
          carts: true,
          // OrderAddons: {
          //   select: {
          //     service: true,
          //   },
          // },
        },
      }),

      this.globalRepository.getCollectionCount({
        whereCondition: whereClause,
        modelName: "Order",
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      meta: {
        limit,
        page,
        totalCount: totalItems,
        totalPages,
      },
      result: products,
    };
  }

  async getAllWarehouseProductForUser(payload: {
    paginationQuery: I_PaginationOptions;
    q?: string;
    status?: ProductStatus;
    user: I_GlobalJwtPayload;
  }): Promise<I_PaginationResponse<any>> {
    // pagination calculations
    const { limit, page, skip } = calculatePagination(payload.paginationQuery);

    // Create cache key based on user, query parameters, and pagination
    const cacheKey = `user:${payload.user.id}:warehouse-products:page:${page}:limit:${limit}:status:${payload.status || "all"}:q:${payload.q || "none"}`;
    const CACHE_TTL = 300; // 5 minutes

    let whereClause: Prisma.OrderWhereInput = {};

    // If there is any status to be filter
    if (payload.status) {
      whereClause = {
        productStatus: payload.status,
      };
    }

    // If there is any search text
    if (payload.q) {
      whereClause = {
        OR: [
          {
            carts: {
              some: {
                title: {
                  contains: payload.q,
                  mode: "insensitive",
                },
              },
            },
          },
        ],
      };
    }

    const [products, totalItems] = await Promise.all([
      this.userAccRepository.getAllProductForUser({
        whereClause: whereClause,
        limit,
        skip,
        include: {
          carts: {
            include: {
              storage: true,
              qc: true,
            },
          },
          // OrderAddons: {
          //   select: {
          //     service: true,
          //   },
          // },
        },
      }),

      this.globalRepository.getCollectionCount({
        whereCondition: whereClause,
        modelName: "Order",
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      meta: {
        limit,
        page,
        totalCount: totalItems,
        totalPages,
      },
      result: products,
    };
  }

  //////////////////////////////////////////////////
  //  _> Parcel //////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async getMyParcels({
    query,
    user,
  }: {
    query: I_GetMyParcelQuery;
    user: I_GlobalJwtPayload;
  }): Promise<I_PaginationResponse<Prisma.PackagesGetPayload<any>[] | []>> {
    const { q, status, ...rest } = query;
    const { limit, page, skip } = calculatePagination(rest);

    // Create cache key based on query and user
    const statusCache = status ? `:status:${status}` : "";
    const queryCache = q ? `:q:${q}` : "";
    const cacheKey = `user:${user.id}:parcels:page:${page}:limit:${limit}${statusCache}${queryCache}`;
    // Try to get from cache first
    try {
      const cachedResult =
        await redisCache.get<
          I_PaginationResponse<Prisma.PackagesGetPayload<any>[]>
        >(cacheKey);

      if (cachedResult) {
        console.log("🥕 Cache hit for:", cacheKey);
        return cachedResult;
      }
    } catch (error) {
      console.error("👾 Redis cache read error:", error);
      // Continue with database query if cache fails
    }

    // Cache miss - query database
    let whereClause: Prisma.PackagesWhereInput = {
      userId: user.id,
    };

    if (status) {
      whereClause = {
        ...whereClause,
        packageStatus: status as PackageStatus,
      };
    }

    if (q) {
      whereClause = {
        ...whereClause,
        OR: [
          { trackingNo: { contains: q, mode: "insensitive" } },
          { courierCompany: { contains: q, mode: "insensitive" } },
          { remarks: { contains: q, mode: "insensitive" } },
        ],
      };
    }

    const [result, totalCount] = await Promise.all([
      this.userAccRepository.getMyParcels({
        where: whereClause,
        take: limit,
        skip,
      }),

      this.globalRepository.getCollectionCount({
        modelName: "Packages",
        whereCondition: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const response: I_PaginationResponse<
      Prisma.PackagesGetPayload<any>[] | []
    > = {
      meta: {
        limit,
        page,
        totalCount,
        totalPages,
      },
      result,
    };

    // Store in cache
    try {
      await redisCache.set(
        cacheKey,
        response,
        redisConfig.TTL_FOR_PACKAGE_GET_PAYLOAD,
      );
      console.log("Cache set for:", cacheKey);
    } catch (error) {
      console.error("Redis cache write error:", error);
    }

    return response;
  }
}

export default UserAccService;
