import { CartProduct, Order, ProductStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import prisma from "../../../../lib/utils/prisma.utils";
import AppError from "../../../errors/appError";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { DeliveryService } from "../../taobao/service/DeliveryService";
import { getSingleItemFromTaobao } from "../../taobao/service/get-single-product.service";
import { I_ItemFeeResponse } from "../../taobao/types/taobao.types";
import { getSafeDeliveryFee } from "../../taobao/utils/deliveryFeeValidation";
import { orderRepository } from "../repository/orders.repository";
import { T_AddToCartProps, T_Sku } from "../types/orders.types";
/**
 * _> add to cart ~ features
 * step 1. Get the product information from the front-end
 * step 2. Check the num_iid from taobao is valid or not
 * step 3. Get the product required information like size, color, quantity etc
 * step 4. check if there any order already exist for this uer or not. If exist:
 **     4.1. Do not create new order
 **     4.2. Create a new cart item and link it to the existing order
 * step 5. Create a new order
 * step 6. Create a new cart item
 ** Note:
 **     1.1.Get the sku price from the taobao response but the quantity would be the front-end client's given quantity
 **/

export const addToCartService = async (payload: {
  user: I_GlobalJwtPayload;
  payload: T_AddToCartProps["body"];
}): Promise<{ order: Order; cart: CartProduct | null }> => {
  // check the product from taobao
  const {
    taobao_num_iid,
    customerRemark,
    skus,
    orderStatus,
    title,
    shortDesc,
    photos,
  } = payload.payload;

  const { id: userId } = payload.user;

  // retrieving product from taobao
  let isProductExist;

  try {
    isProductExist = await getSingleItemFromTaobao({
      num_iid: taobao_num_iid,
    });
  } catch (error) {
    throw new AppError(
      HttpStatusCode.NotFound,
      `${(error as Error).message || "Product not found in Taobao"}`,
    );
  }

  // compute the total price and local delivery fee's
  const deliveryFee = (await DeliveryService.calculateFee({
    productId: taobao_num_iid,
  })) as I_ItemFeeResponse;

  /**
   * Sometimes express delivery is free, in this case they return text like "免运费"
   * So we've to determine is it free or not
   * Using this function to get the safe delivery fees
   *  */
  const LOCAL_DELIVERY_FEE = getSafeDeliveryFee(deliveryFee);

  let skuPrice = 0;
  let totalQuantityFromSku = 0;

  // if there is skus price
  if (skus.length === 0) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "Order quantity must be provided! Minimum 1 x product is required.",
    );
  } else {
    skuPrice = (skus as T_Sku["body"][]).reduce((total, sku) => {
      return total + sku.price * sku.quantity;
    }, 0);

    totalQuantityFromSku = (skus as T_Sku["body"][]).reduce((total, sku) => {
      return total + sku.quantity;
    }, 0);
  }

  let placeOrder;

  // lookup for the existence order
  const isOrderExist = await orderRepository.getSingleOrderByUserID(userId, {
    id: true,
    totalPrice: true,
    localDeliveryFee: true,
    carts: {
      select: {
        id: true,
      },
    },
  });

  // If there is no order exist before for this user create order collection first and add the cart product to that order
  if (!isOrderExist) {
    placeOrder = await prisma.$transaction(
      async (tx) => {
        const order = await orderRepository.createOrder(
          {
            totalPrice: skuPrice,
            localDeliveryFee: Number(LOCAL_DELIVERY_FEE),
            customerRemark: customerRemark ? customerRemark : "N/A",
            orderStatus: "PAYMENT_PENDING",
            productStatus: orderStatus
              ? (orderStatus as ProductStatus)
              : ("PAYMENT_PENDING" as ProductStatus),
            userId,
            serviceAddonFees: 0, // by default it will be zero. In checkout page user will have the options to choose the addons
          },
          tx, // Prisma TransactionClient
        );

        const crateCart = await orderRepository.createCart(
          {
            title,
            shortDesc: shortDesc ? shortDesc : "N/A",
            quantity: totalQuantityFromSku, // total quantity of every sku's that passed via payload from front-end
            price: skuPrice,
            photos,
            sku: skus,
            taobao_num_iid,
            orderId: order.id,
            deliveryFee: Number(LOCAL_DELIVERY_FEE),
          },
          tx, // Prisma TransactionClient
        );

        return {
          order,
          cart: crateCart,
        };
      },
      {
        maxWait: 10000,
        timeout: 60000,
      },

      // ! sent a mail to the user inbox that the order is placed successfully
    );

    return placeOrder;
  } else {
    /**
     * If order is alary exist
     * step 0. Check if the product is valid or not
     * step 1. If order already exist then add the product to the cart
     * step 2. Update the order also
     * step 3. But, if the product is already in a cart of the same order's collection then update the quantity only
     ** step 3.1. Also update the order price and cart price in total
     * */

    // step 0. Check if the product is valid or not
    const isCartExistInOrder = await orderRepository.getCatProduct({
      whereClause: {
        orderId: isOrderExist.id,
        taobao_num_iid,
      },
    });

    // step 1. If order already, for this user, exist then add the product to the cart and update the order
    if (!isCartExistInOrder) {
      const crateCartAndUpdateOrder = await prisma.$transaction(async (tx) => {
        const order = await orderRepository.createCart(
          {
            title,
            shortDesc: shortDesc ? shortDesc : "N/A",
            quantity: totalQuantityFromSku,
            price: skuPrice,
            photos,
            sku: skus,
            taobao_num_iid,
            orderId: isOrderExist.id,
            deliveryFee: Number(LOCAL_DELIVERY_FEE),
          },
          tx, // Prisma TransactionClient
        );
        //update the order price
        const updatedOrder = await orderRepository.updateOrder(
          {
            orderId: isOrderExist.id,
            payload: {
              localDeliveryFee:
                isOrderExist.localDeliveryFee + LOCAL_DELIVERY_FEE,
              totalPrice: isOrderExist.totalPrice + skuPrice,
            },
          },
          tx,
        );

        return {
          order: updatedOrder,
          cart: order,
        };
      });

      // Main returning for the function
      return {
        cart: crateCartAndUpdateOrder.cart,
        order: crateCartAndUpdateOrder.order,
      };
    }

    // If the order is exist and the product is already in the cart of the same order then update the quantity only
    else {
      // now calculate the skus and update the total quantity and price both in cart and order
      const oldSkus = isCartExistInOrder.sku as T_Sku["body"][];
      const newSkus = skus;

      // Create a map to consolidate all SKUs
      const skuMap = new Map();

      // First consolidate existing SKUs
      oldSkus.forEach((sku) => {
        if (skuMap.has(sku.sku_id)) {
          const existing = skuMap.get(sku.sku_id);
          existing.quantity += sku.quantity;
        } else {
          skuMap.set(sku.sku_id, { ...sku });
        }
      });

      // Then merge with incoming SKUs
      newSkus.forEach((sku) => {
        if (skuMap.has(sku.sku_id)) {
          const existing = skuMap.get(sku.sku_id);
          existing.quantity += sku.quantity;
        } else {
          skuMap.set(sku.sku_id, { ...sku });
        }
      });

      // Convert back to array and filter for quantity > 0
      const finalSkus = Array.from(skuMap.values()).filter(
        (sku) => sku.quantity > 0,
      );

      // Calculate totals
      const totalQuantityFromNewSkus = finalSkus.reduce(
        (sum, sku) => sum + sku.quantity,
        0,
      );

      // calculating the total sku price dynamically for both order and individual cart
      const totalPriceFromNewSkus = (skus: T_Sku["body"][]) =>
        skus.reduce((total, sku) => {
          return total + sku.price * sku.quantity;
        }, 0);

      const totalPriceForFinalSkus = totalPriceFromNewSkus(finalSkus);

      const crateCartAndUpdateOrder = await prisma.$transaction(async (tx) => {
        // If all SKUs are removed, delete the cart item
        if (finalSkus.length === 0) {
          await orderRepository.deleteCart(
            {
              cartId: isCartExistInOrder.id,
            },
            tx,
          );

          const updatedOrder = await orderRepository.updateOrder(
            {
              orderId: isOrderExist.id,
              payload: {
                totalPrice:
                  isOrderExist.totalPrice - totalPriceFromNewSkus(oldSkus),
                localDeliveryFee:
                  isOrderExist.localDeliveryFee -
                  isCartExistInOrder.deliveryFee,
              },
            },
            tx,
          );

          return {
            order: updatedOrder,
            cart: null,
          };
        } else {
          // Update cart with FINAL skus (consolidated)
          const order = await orderRepository.updateCart(
            {
              cartId: isCartExistInOrder.id,
              payload: {
                sku: finalSkus,
                quantity: totalQuantityFromNewSkus,
                price: totalPriceForFinalSkus,
              },
            },
            tx,
          );

          // Calculate the price difference to add to order
          const priceDifference =
            totalPriceForFinalSkus - totalPriceFromNewSkus(oldSkus);

          // Update the order price by adding the difference
          const updatedOrder = await orderRepository.updateOrder(
            {
              orderId: isOrderExist.id,
              payload: {
                totalPrice: isOrderExist.totalPrice + priceDifference,
              },
            },
            tx,
          );

          return {
            order: updatedOrder,
            cart: order,
          };
        }
      });

      // Main returning for the function
      return {
        cart: crateCartAndUpdateOrder.cart,
        order: crateCartAndUpdateOrder.order,
      };
    }
  }
};
