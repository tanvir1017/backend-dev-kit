import {
  CartProduct,
  OrderStatus,
  Prisma,
  ProductStatus,
  QcDetails,
} from "@prisma/client";
import { HttpStatusCode } from "axios";
import prisma from "../../../../../lib/utils/prisma.utils";
import AppError from "../../../../errors/appError";
import { T_PrismaModelOmittedProp } from "../../../../interface/common.interface";
import { I_GetAllCartProducts } from "../types/products.types";

class OrderRepository {
  private prisma;
  constructor() {
    this.prisma = prisma;
  }

  // Get all the order
  async getAllOrders({
    whereClause,
    includes = {
      user: true,
    },
    props = {
      orderBy: {
        createdAt: "desc",
      },
    },
  }: {
    whereClause: Prisma.OrderWhereInput;
    includes?: Prisma.OrderInclude;
    props?: Record<string, any>;
  }) {
    const allProducts = await prisma.order.findMany({
      where: whereClause,
      include: includes,
      ...props,
    });
    return allProducts;
  }

  // Get all the cart
  async getAllCarts(
    {
      whereClause,
      select = {
        Order: true,
      },
      props,
    }: I_GetAllCartProducts,
    tx: Prisma.TransactionClient = prisma,
  ) {
    const allProducts = await tx.cartProduct.findMany({
      where: whereClause,
      select: select,
      ...props,
    });
    return allProducts;
  }

  // Alternative method to get orders with more specific filtering
  // async getOrdersByFilters(filters: {
  //   userId?: string;
  //   productStatuses?: ProductStatus[];
  //   orderStatuses?: OrderStatus[];
  //   startDate?: Date;
  //   endDate?: Date;
  //   page?: number;
  //   limit?: number;
  // }) {
  //   const {
  //     userId,
  //     productStatuses,
  //     orderStatuses,
  //     startDate,
  //     endDate,
  //     page = 1,
  //     limit = 10,
  //   } = filters;

  //   const skip = (page - 1) * limit;

  //   const where: any = {};

  //   if (userId) {
  //     where.userId = userId;
  //   }

  //   if (productStatuses && productStatuses.length > 0) {
  //     where.productStatus = { in: productStatuses };
  //   }

  //   if (orderStatuses && orderStatuses.length > 0) {
  //     where.orderStatus = { in: orderStatuses };
  //   }

  //   if (startDate || endDate) {
  //     where.createdAt = {};
  //     if (startDate) where.createdAt.gte = startDate;
  //     if (endDate) where.createdAt.lte = endDate;
  //   }

  //   const totalItems = await prisma.order.count({ where });

  //   const orders = await prisma.order.findMany({
  //     where,
  //     include: {
  //       user: {
  //         select: {
  //           memberId: true,
  //           email: true,
  //         },
  //       },
  //       carts: true,
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     skip,
  //     take: limit,
  //   });

  //   const totalPages = Math.ceil(totalItems / limit);

  //   return {
  //     data: orders,
  //     pagination: {
  //       currentPage: page,
  //       totalPages,
  //       totalItems,
  //       hasNext: page < totalPages,
  //       hasPrevious: page > 1,
  //     },
  //   };
  // }

  // // Get order by ID with all relations
  async getOrderById({
    orderId,
    orderStatus,
    productStatus,
    includes,
    select,
  }: {
    orderId: string;
    orderStatus?: OrderStatus;
    productStatus?: ProductStatus;
    includes?: Prisma.OrderInclude;
    select?: Prisma.OrderSelect;
  }) {
    return await prisma.order.findUnique({
      where: {
        id: orderId,
        ...(productStatus && { productStatus }),
        ...(orderStatus && { orderStatus }),
      },
      ...(includes && { include: includes }),
      ...(select && { select }),
    });
  }

  // Update order status
  async changeProductStatusInDb({
    productId,
    productStatus,
  }: {
    productId: string;
    productStatus: ProductStatus;
  }) {
    return await this.prisma.order.update({
      where: { id: productId },
      data: {
        productStatus,
      },
    });
  }

  // Update order status
  async getProductById<
    T extends {
      include?: Prisma.CartProductInclude;
      select?: Prisma.CartProductSelect;
    },
  >({ productId, include, select }: T & { productId: string }) {
    return this.prisma.cartProduct.findUnique({
      where: { id: productId },
      ...(include && { include }),
      ...(select && { select }),
    }) as Promise<Prisma.CartProductGetPayload<T> | null>;
  }

  // Get order by ID's
  async getProductByIds<T extends Prisma.CartProductDefaultArgs>({
    productIds,
    include,
    select,
    userId,
  }: T & { productIds: string[]; userId: string }) {
    return this.prisma.cartProduct.findMany({
      where: {
        id: {
          in: productIds,
        },
        Order: {
          userId: userId,
        },
      },
      ...(include && { include }),
      ...(select && { select }),
    }) as Promise<Prisma.CartProductGetPayload<T>[] | null>;
  }

  // Update product cart
  async updateCartProduct(
    {
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CartProduct>;
    },
    tx: typeof prisma | Prisma.TransactionClient = prisma,
  ) {
    return tx.cartProduct.update({
      where: {
        id,
      },
      data: payload,
    });
  }

  async updateProductsWithPackageId(
    {
      productIds,
      packageId,
    }: {
      productIds: string[];
      packageId: string;
    },
    tx: typeof prisma | Prisma.TransactionClient = prisma,
  ) {
    try {
      // Update all products with the given IDs to set the packageId
      const updateResult = await tx.cartProduct.updateMany({
        where: {
          id: {
            in: productIds,
          },
        },
        data: {
          packagesId: packageId,
        },
      });
      return updateResult;
    } catch (error) {
      console.error("❌ Error updating products with packageId:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to update products with packageId: ${(error as Error).message}`,
      );
    }
  }

  // Update with mongo native
  async updateProductsMongoNative(productIds: string[], packageId: string) {
    // Single query to update all products
    const result = await prisma.$runCommandRaw({
      update: "cart-product", // This should match your MongoDB collection name
      updates: [
        {
          q: {
            _id: {
              $in: productIds.map((id) => ({ $oid: id })),
            },
          },
          u: {
            $set: {
              packagesId: { $oid: packageId },
            },
          },
          multi: true,
        },
      ],
    });

    return result;
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  // _> Qc Details ~ Modules
  //////////////////////////////////////////////////////////////////////////////////////////
  // Create QC
  async getQcDetailsById<
    T extends {
      includes?: Prisma.QcDetailsInclude;
      select?: Prisma.QcDetailsSelect;
    },
  >({ qcId, includes, select }: T & { qcId: string }) {
    return this.prisma.qcDetails.findUnique({
      where: {
        id: qcId,
      },
      ...(includes && { include: includes }),
      ...(select && { select }),
    }) as Promise<Prisma.QcDetailsGetPayload<T> | null>;
  }

  // Create QC
  async createQcDetails(payload: Omit<QcDetails, T_PrismaModelOmittedProp>) {
    return await this.prisma.qcDetails.create({
      data: payload,
    });
  }

  // Update QC
  async updateQcDetails<
    T extends {
      includes?: Prisma.QcDetailsInclude;
      select?: Prisma.QcDetailsSelect;
    },
  >({
    payload,
    qcId,
    includes,
    select,
  }: T & {
    payload: Partial<QcDetails>;
    qcId: string;
  }) {
    return this.prisma.qcDetails.update({
      where: {
        id: qcId,
      },
      data: payload,
      ...(select && { select }),
      ...(includes && { include: includes }),
    }) as Prisma.Prisma__QcDetailsClient<Prisma.QcDetailsGetPayload<T>>;
  }

  // Delete QC
  async deleteQcDetailsFromDb({ qcId }: { qcId: string }) {
    return await this.prisma.qcDetails.delete({
      where: {
        id: qcId,
      },
    });
  }
}

export default OrderRepository;
