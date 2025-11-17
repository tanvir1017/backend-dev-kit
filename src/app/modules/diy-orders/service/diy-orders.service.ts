import { DiyOrders, Prisma, UserRole } from "@prisma/client";
import { HttpStatusCode } from "axios";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import AppError from "../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../interface/common.interface";
import { globalRepository } from "../../global/repository/global.repository";
import { diyOrderRepo } from "../repository/diy-orders.repository";

class DiyOrderService {
  constructor() {}

  // Calculate total amount
  calculateTotal(productPrice: number, deliveryFee: number): number {
    return productPrice + deliveryFee;
  }

  // Create new DIY order
  async createNewDiyOrder({
    payload,
    user,
    file,
  }: {
    payload: DiyOrders;
    user: I_GlobalJwtPayload;
    file: Express.Multer.File;
  }) {
    // check if the order is done by the user or not
    if (
      !(["ADMIN", "SUPER_ADMIN", "MEMBER"] as UserRole[]).includes(user.role)
    ) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "You are not authorized to perform this action!",
      );
    }

    if (file) {
      const { Location: imageUrl } =
        await bucketStorageService.uploadToDigitalOceanAWS(file);
      payload.productPic = imageUrl;
    }

    return await diyOrderRepo.createDiyOrder({
      data: {
        ...payload,
        userId: user.id,
      },
    });
  }

  //   // Get all DIY orders for user
  async getUserDiyOrders({
    query,
    user,
  }: {
    user: I_GlobalJwtPayload;
    query: I_PaginationOptions;
  }): Promise<I_PaginationResponse<DiyOrders[]>> {
    const { limit, page, skip, sortOrder, sortBy } = calculatePagination(query);

    let whereClause: Prisma.DiyOrdersWhereInput = {};

    if (user.role === "MEMBER") {
      whereClause = {
        userId: user.id,
      };
    }

    const [result, totalCount] = await Promise.all([
      diyOrderRepo.getAllDiyOrders({
        where: whereClause,
        take: limit,
        skip,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      globalRepository.getCollectionCount({
        modelName: "DiyOrders",
        whereCondition: whereClause,
      }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      result,
    };
  }

  //   // Get single DIY order
  //   async getSingleDiyOrder(orderId: string, userId: string) {
  //     const order = await diyOrderRepo.getSingleDiyOrder({
  //       id: orderId,
  //       userId: userId,
  //     });

  //     if (!order) {
  //       throw new Error("DIY Order not found");
  //     }

  //     return order;
  //   }

  //   // Update DIY order
  //   async updateDiyOrder(
  //     orderId: string,
  //     userId: string,
  //     payload: Prisma.DIYOrderUpdateInput,
  //   ) {
  //     // Verify order exists and belongs to user
  //     await this.getSingleDiyOrder(orderId, userId);

  //     // Recalculate total if productPrice or deliveryFee is updated
  //     if (payload.productPrice || payload.deliveryFee) {
  //       const currentOrder = await this.getSingleDiyOrder(orderId, userId);
  //       const newProductPrice =
  //         (payload.productPrice as number) || currentOrder.productPrice;
  //       const newDeliveryFee =
  //         (payload.deliveryFee as number) || currentOrder.deliveryFee;
  //       payload.total = this.calculateTotal(newProductPrice, newDeliveryFee);
  //     }

  //     return await diyOrderRepo.updateDiyOrder({
  //       where: { id: orderId },
  //       data: payload,
  //     });
  //   }

  //   // Delete DIY order
  //   async deleteDiyOrder(orderId: string, userId: string) {
  //     // Verify order exists and belongs to user
  //     await this.getSingleDiyOrder(orderId, userId);

  //     return await diyOrderRepo.deleteDiyOrder({
  //       where: { id: orderId },
  //     });
  //   }

  //   // Add to cart (update status to IN_CART)
  //   async addToCart(orderId: string, userId: string) {
  //     await this.getSingleDiyOrder(orderId, userId);

  //     return await diyOrderRepo.updateDiyOrder({
  //       where: { id: orderId },
  //       data: { status: "IN_CART" },
  //     });
  //   }
}

export const diyOrderService = new DiyOrderService();
