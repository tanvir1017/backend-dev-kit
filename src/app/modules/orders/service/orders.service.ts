import { OrderStatus, ProductStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import prisma from "../../../../lib/utils/prisma.utils";
import AppError from "../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../interface/common.interface";

import GlobalRepository from "../../global/repository/global.repository";
import { serviceManagementRepository } from "../../service-management/repository/service-management.repository";
import { orderRepository } from "../repository/orders.repository";
import { T_AddonServiceProps, T_CartsReturnTypes } from "../types/orders.types";
import { addToCartService } from "./add-to-cart.service";

/* [
  {"sku_id":"5936817658653","price":6999,"original_price":6999,"properties_name":"1627207:29974579566:body color:秘矿紫;;5919063:6536025:Package Type:官方标配 分期+1年延保;;12304035:3017674673:storage capacity:12GB+256GB","quantity":2}
] */

const globalRepository = new GlobalRepository();
export const orderServices = {
  // Add to cart
  addToCart: addToCartService,

  /**
   * Remove the product from the cart
   *  */
  removeCartProduct: async (payload: {
    user: I_GlobalJwtPayload;
    cartProductId: string;
  }) => {
    const { id: userId } = payload.user;

    // check if the order is exist or not
    const isProductExist = await orderRepository.getSingleCart({
      cartProdId: payload.cartProductId,
      includes: {
        Order: true,
      },
    });

    if (!isProductExist) {
      throw new AppError(HttpStatusCode.NotFound, "Product not found!");
    }
    // check the order belongs to this user or not

    if (isProductExist.Order.userId !== userId) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "Order doesn't belong to this user!",
      );
    }

    // get the skus and its quantity to reduce the total price

    const removeProduct = await orderRepository.removeCartProduct(
      payload.cartProductId,
    );
  },

  /**
   * Retrieve the logged in user's carts from the database
   * @param {I_GlobalJwtPayload} user - The logged in user
   * @param {I_PaginationOptions} query - The pagination query
   * @returns {Promise<I_PaginationResponse<T_CartsReturnTypes[]>>} - The pagination schema with the logged in user's carts
   */
  getMyCartsFromDb: async ({
    user,
    query,
  }: {
    user: I_GlobalJwtPayload;
    query: I_PaginationOptions;
  }) => {
    // Throw error if the role of the user is not meet
    // if (![UserRole.MEMBER].includes(user.role as any)) {
    //   throw new AppError(
    //     HttpStatusCode.Forbidden,
    //     "You are not allowed to access this resource!",
    //   );
    // }

    const { limit, page, skip, sortOrder, sortBy } = calculatePagination(query);

    const [result, totalCount] = await Promise.all([
      // Get the orders
      orderRepository.myCarts({
        skip,
        take: limit,
        where: {
          Order: {
            userId: user.id,
            orderStatus: OrderStatus.PAYMENT_PENDING,
          },
        },
        include: {
          Order: true,
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      // Get the total count of orders (not limited by pagination)
      globalRepository.getCollectionCount({
        modelName: "CartProduct",
        whereCondition: {
          Order: {
            productStatus: ProductStatus.PENDING_PAYMENT, // Only count items in pending orders
            userId: user.id,
          },
        },
      }),
    ]);

    // Calculate totalPages for pagination
    const totalPages = Math.ceil(totalCount / limit);

    // pagination return data schema
    const paginationSchema: I_PaginationResponse<any[]> = {
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      result,
    };

    return paginationSchema;
  },

  // add addon-service(s) to order
  // supports a single addon id or an array of addon ids
  addonServiceOnOrder: async (payload: T_AddonServiceProps) => {
    const {
      orderId,
      addonServiceId,
      user: { id: userId },
    } = payload;

    // normalize to array
    const addonIds: string[] = Array.isArray(addonServiceId)
      ? addonServiceId
      : [addonServiceId];

    // fetch all services (by ids) and the order concurrently
    const [services, isOrderExist] = await Promise.all([
      serviceManagementRepository.getServiceManagement(addonIds),
      orderRepository.getSingleOrderByID(
        { id: orderId },
        { id: true, userId: true, totalPrice: true, serviceAddonFees: true },
      ),
    ]);

    // verify order exists
    if (!isOrderExist) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found");
    }

    if (isOrderExist.userId !== userId) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "Order doesn't belong to this user!",
      );
    }

    // verify all services exist (match by id)
    const foundIds = new Set(services.map((s) => s.id));
    const missing = addonIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new AppError(
        HttpStatusCode.NotFound,
        `Service(s) not found: ${missing.join(", ")}`,
      );
    }

    // calculate total addon fees.
    // Use the product base total (order total minus existing serviceAddonFees)
    // so percentage-based addons are always calculated against product amount only.
    const baseProductTotal =
      (isOrderExist.totalPrice || 0) - (isOrderExist.serviceAddonFees || 0);

    let totalAddonFees = 0;
    for (const svc of services) {
      if (!svc) continue; // safety
      if (svc.typeOfCharge === "Percentage_of_products_amount") {
        totalAddonFees += (baseProductTotal * (svc.fee as number)) / 100;
      } else {
        totalAddonFees += svc.fee as number;
      }
    }

    // Persist all addon relations and update order inside a single transaction
    const result = await prisma.$transaction(
      async (tx) => {
        const createdAddons: any[] = [];

        // create order-addons for each requested service
        for (const svcId of addonIds) {
          const addon = await orderRepository.createOrderAddons({
            payload: {
              orderId: isOrderExist.id,
              serviceId: svcId,
            },
            tx,
          });
          createdAddons.push(addon);
        }

        // update order: accumulate serviceAddonFees and totalPrice
        const updatedOrder = await orderRepository.updateOrder(
          {
            orderId: isOrderExist.id,
            payload: {
              serviceAddonFees:
                (isOrderExist.serviceAddonFees || 0) + totalAddonFees,
              totalPrice: isOrderExist.totalPrice + totalAddonFees,
            },
          },
          tx,
        );

        return { createdAddons, updatedOrder };
      },
      {
        maxWait: 10000,
        timeout: 60000,
      },
    );

    return result;
  },

  // remove addon-service(s) from order
  // supports removing multiple service ids
  removeAddonServiceFromOrder: async (payload: T_AddonServiceProps) => {
    const {
      orderId,
      addonServiceId,
      user: { id: userId },
    } = payload;

    // normalize ids
    const addonIds = Array.isArray(addonServiceId)
      ? addonServiceId
      : [addonServiceId];

    // verify order exists
    const order = await orderRepository.getSingleOrderByID({ id: orderId });
    if (!order) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found!");
    }

    // ensure order belongs to user
    const isOrderBelongsToUser =
      await orderRepository.getSingleOrderByUserID(userId);

    if (!isOrderBelongsToUser) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Order doesn't belong to this user!",
      );
    }

    // fetch services by ids
    const services =
      await serviceManagementRepository.getServiceManagement(addonIds);

    // ensure all requested services exist
    const foundIds = new Set(services.map((s) => s.id));
    const missing = addonIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw new AppError(
        HttpStatusCode.NotFound,
        `Service(s) not found: ${missing.join(", ")}`,
      );
    }

    // compute fees to remove based on base product total
    const baseProductTotal =
      (order.totalPrice || 0) - (order.serviceAddonFees || 0);
    let totalRemovedFees = 0;
    for (const svc of services) {
      if (svc.typeOfCharge === "Percentage_of_products_amount") {
        totalRemovedFees += (baseProductTotal * (svc.fee as number)) / 100;
      } else {
        totalRemovedFees += svc.fee as number;
      }
    }

    // remove addons and update order inside transaction
    const removed = await prisma.$transaction(
      async (tx) => {
        const removedAddons: any[] = [];

        for (const svcId of addonIds) {
          const findOrderAddons = await orderRepository.getSingleOrderAddons({
            orderId: order.id,
            serviceId: svcId,
          });

          if (!findOrderAddons) {
            throw new AppError(
              HttpStatusCode.NotFound,
              `Service not found for this order: ${svcId}`,
            );
          }

          const ra = await tx.orderAddons.delete({
            where: { id: findOrderAddons.id },
          });
          removedAddons.push(ra);
        }

        const updatedOrder = await orderRepository.updateOrder(
          {
            orderId: order.id,
            payload: {
              serviceAddonFees:
                (order.serviceAddonFees || 0) - totalRemovedFees,
              totalPrice: (order.totalPrice || 0) - totalRemovedFees,
            },
          },
          tx,
        );

        return { removedAddons, updatedOrder };
      },
      {
        maxWait: 10000,
        timeout: 60000,
      },
    );

    return removed;
  },

  // Get all the orders(Product Lists)
  getAllProductListsFromDb: async () => {
    const result = await orderRepository.getAllProductLists(); // product -> orders collections
    if (!result) {
      throw new AppError(HttpStatusCode.NotFound, "Product lists not found!");
    }
    return result;
  },
};
