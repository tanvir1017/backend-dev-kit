import {
  OrderStatus,
  Prisma,
  ProductStatus,
  TypeOfCharge,
  UserRole,
} from "@prisma/client";
import { HttpStatusCode } from "axios";
import AppError from "../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../interface/common.interface";
import { orderRepository } from "../../orders/repository/orders.repository";
import { T_Sku } from "../../orders/types/orders.types";

import Stripe from "stripe";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import PackageRepo from "../../dashboard/packages/repository/packages.repository";
import GlobalRepository from "../../global/repository/global.repository";
import StripeRepository from "../../stripe/repository/stripe.repository";
import { paymentRepository } from "../repository/payment.repository";
import {
  I_CreateCheckoutSessionProps,
  I_RefundListParams,
  I_RefundPayload,
  T_payments,
} from "../types/payment.types";
import CurrencyConverter from "../utils/CurrencyConversion.utils";

class PaymentService {
  private stripeRepository: StripeRepository;
  private globalRepository: GlobalRepository;
  private pkgRepository: PackageRepo;

  constructor() {
    this.stripeRepository = new StripeRepository();
    this.globalRepository = new GlobalRepository();
    this.pkgRepository = new PackageRepo();
  }
  async createCheckoutSession(payload: I_CreateCheckoutSessionProps) {
    const { user, orderId, isUseCustomerBalance } = payload;

    // Step 01. Get the order collection first
    const isOrderExist = await orderRepository.getSingleOrderByID(
      // where clause
      {
        id: orderId,
        userId: user.id,
        orderStatus: OrderStatus.PAYMENT_PENDING,
      },
      {
        totalPrice: true,
        localDeliveryFee: true,
        user: {
          select: {
            email: true,
            id: true,
          },
        },

        carts: {
          select: {
            title: true,
            sku: true,
          },
        },
        OrderAddons: {
          select: {
            service: {
              select: {
                orderType: true,
                typeOfCharge: true,
                service: true,
                fee: true,
              },
            },
          },
        },
      },
    );

    if (!isOrderExist) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found");
    }

    const { OrderAddons, totalPrice, localDeliveryFee, carts } = isOrderExist;
    // Separate fixed and percentage addons
    const fixedAddons = OrderAddons.filter(
      (item: any) =>
        item.service.typeOfCharge === TypeOfCharge.Fixed_amount_for_each_pcs,
    );

    const percentageAddons = OrderAddons.filter(
      (item: any) =>
        item.service.typeOfCharge ===
        TypeOfCharge.Percentage_of_products_amount,
    );

    // Calculate percentage addons based on cart total
    const percentageAddonsCalculated = percentageAddons.map((item: any) => {
      const service = item.service;
      const percentageAmount = (totalPrice * service.fee) / 100;

      return {
        name: `${service.service} (${service.fee}% of products)`,
        price: percentageAmount,
      };
    });

    // Fixed addons remain as-is
    const fixedAddonsCalculated = fixedAddons.map((item: any) => ({
      name: item.service.service,
      price: item.service.fee,
    }));

    // selected addons
    const selectedAddons = [
      ...percentageAddonsCalculated,
      ...fixedAddonsCalculated,
    ];

    const lineItems = [
      // Add all cart items with their quantities
      ...carts.flatMap((item) => {
        if (!item.sku) return [];
        const skus = (item.sku as T_Sku["body"][]).map((skuItem) => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${item.title}`,
            },
            unit_amount: CurrencyConverter.toCents(skuItem.price), // skuItem.price,
          },
          quantity: skuItem.quantity,
        }));

        return skus;
      }),
      ...selectedAddons.map((addon) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: addon.name,
          },
          unit_amount: CurrencyConverter.toCents(addon.price),
        },
        quantity: 1,
      })),
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Delivery Fee",
          },
          unit_amount: CurrencyConverter.toCents(localDeliveryFee),
        },
        quantity: 1,
      },
    ];

    const session = await this.stripeRepository.createP_PurchaseCheckoutSession(
      {
        line_items: lineItems,
        isUseCustomerBalance: isUseCustomerBalance || "false",
        customerInfo: {
          userId: user.id,
          email: user.email,
        },
        orderMetaData: {
          orderId: orderId,
        },
      },
    );

    return {
      sessionId: session.id,
      url: session.url!, // The hosted checkout page URL
    };
  }

  // Initiate the refund process for the order
  async initiateTheRefundProcess(payload: {
    user: I_GlobalJwtPayload;
    orderId: string;
    payload: I_RefundPayload;
  }) {
    const { user, orderId, payload: refundPayload } = payload;
    const role = user.role;
    /**
     * Is the order is assigned to this purchasing stuff?
     * If it is purchased/pending_purchase(user already paid) or not
     * check the amount validation
     *
     */

    // Step 01. Get the order collection first
    const isOrderExist = await orderRepository.getSingleOrderByID(
      // where clause
      {
        id: orderId,
        userId: refundPayload.userId,
        productStatus: {
          in: [ProductStatus.PURCHASED, ProductStatus.PENDING_PURCHASE],
        },
        ...(role === "PURCHASING_AGENT" && {
          pa_wh: {
            purchasingAgentId: user.id,
          },
        }),
      },

      // get payload
      {
        totalPrice: true,
        payment: {
          select: {
            stripeChargeId: true,
          },
        },
        user: {
          select: {
            stripeCustomerId: true,
            email: true,
            id: true,
          },
        },
      },
    );

    if (!isOrderExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Invalid order to make refund",
      );
    }

    // get the charge id from payment collection
    const chargeId = isOrderExist.payment.find(
      (chId) => chId.stripeChargeId === refundPayload.stripeChargeId,
    );

    if (!chargeId) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Invalid charge id to make refund",
      );
    }

    // Step 02. Initiate the refund
    const refund = await this.stripeRepository.initializeRefundPayment({
      chargeId: chargeId.stripeChargeId as string,
      amount: CurrencyConverter.toCents(refundPayload.amount),
      customerId: isOrderExist.user.stripeCustomerId as string,
      orderId: isOrderExist.id,
      paymentId: refundPayload.paymentId,
      userId: refundPayload.userId,
      reason: refundPayload.reason,
    });

    return {
      amount: refund.amount,
      trxId: refund.balance_transaction,
      refundedAt: refund.created,
      refundStatus: refund.status,
    };
  }

  // Initiate the refund process for the shipping cost of pkg
  async initiateThePkgRefundProcess(payload: {
    user: I_GlobalJwtPayload;
    pkgId: string;
    payload: I_RefundPayload;
  }) {
    const { user, pkgId, payload: refundPayload } = payload;

    if (!(["ADMIN", "SUPER_ADMIN"] as UserRole[]).includes(user.role)) {
      throw new AppError(HttpStatusCode.Forbidden, "Forbidden");
    }

    /**
     * Is the order is assigned to this purchasing stuff?
     * If it is purchased/pending_purchase(user already paid) or not
     * check the amount validation
     *
     */

    // Step 01. Get the order collection first
    const isPkgExist = await this.pkgRepository.getPackageByItsId({
      where: {
        id: pkgId,
      },
      select: {
        id: true,
        user: {
          select: {
            stripeCustomerId: true,
            email: true,
            id: true,
          },
        },
        payment: {
          select: {
            id: true,
            stripeChargeId: true,
          },
        },
      },
    });

    if (!isPkgExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Invalid pkg information or not found",
      );
    }

    // get the charge id from payment collection
    const chargeId = isPkgExist.payment.find(
      (chId) => chId.stripeChargeId === refundPayload.stripeChargeId,
    );

    if (!chargeId) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Invalid charge id to make refund",
      );
    }

    // Step 02. Initiate the refund
    const refund =
      await this.stripeRepository.initializeRefundPaymentForShipping({
        chargeId: chargeId.stripeChargeId as string,
        amount: CurrencyConverter.toCents(refundPayload.amount),
        customerId: isPkgExist.user.stripeCustomerId as string,
        pkgId: isPkgExist.id,
        paymentId: refundPayload.paymentId,
        userId: refundPayload.userId,
        reason: refundPayload.reason,
      });

    return {
      amount: refund.amount,
      trxId: refund.balance_transaction,
      refundedAt: refund.created,
      refundStatus: refund.status,
    };
  }

  // Retrieve Refund List from stripe
  async retrieveRefundList(params: I_RefundListParams) {
    let refunds = await this.stripeRepository.getRefundList(params);
    // Apply search filter if provided
    if (params.q) {
      refunds = this.applySearchFilter(refunds, params.q);
    }
    return this.transformRefundResponse(refunds, params);
  }

  // Retrieve Order's payment List from db
  async retrieveOrdersPayments(
    params: I_PaginationOptions,
    reqParams: { orderId: string },
    user: I_GlobalJwtPayload,
  ): Promise<I_PaginationResponse<T_payments[]>> {
    const { limit, page, skip } = calculatePagination(params);
    const role = user.role;
    // check if the order is exist or not
    const isOrderExist = await orderRepository.getSingleOrderByID({
      id: reqParams.orderId,
      ...(role === "PURCHASING_AGENT" && {
        pa_wh: {
          purchasingAgentId: user.id,
        },
      }),
    });

    if (!isOrderExist) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found");
    }
    let whereClause: Prisma.PaymentWhereInput = {
      orderId: reqParams.orderId,
    };
    // get the payments for this order
    const [payments, totalItems] = await Promise.all([
      paymentRepository.getPaymentListByOrderId({
        limit,
        skip,
        whereClause,
        select: {
          id: true,
          stripeChargeId: true,
          stripePaymentIntentId: true,
          stripeSessionId: true,

          amountTotal: true,
          currency: true,
          status: true,
        },
      }),
      this.globalRepository.getCollectionCount({
        modelName: "Payment",
        whereCondition: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      meta: {
        limit,
        page,
        totalPages,
        totalCount: totalItems,
      },
      result: payments,
    };
  }

  private transformRefundResponse(
    stripeRefunds: Stripe.Response<Stripe.ApiList<Stripe.Refund>>,
    params: I_RefundListParams,
  ): I_PaginationResponse<any[]> {
    const { page, limit } = params;

    // Transform Stripe response to our format
    const transformedData = stripeRefunds.data.map((refund: any) => ({
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      chargeId: refund.charge,
      paymentIntentId: refund.payment_intent,
      reason: refund.metadata.reason ?? "Not Provided",
      created: new Date(refund.created * 1000),
      balanceTransactionId: refund.balance_transaction,
      receiptNumber: refund.receipt_number,
      metadata: refund.metadata,
      // Add searchable fields for frontend
      //searchableText: this.generateSearchableText(refund),
    }));

    return {
      meta: {
        totalCount: stripeRefunds.has_more
          ? page * limit + transformedData.length
          : (page - 1) * limit + transformedData.length,
        totalPages: stripeRefunds.has_more
          ? Math.ceil((page * limit + transformedData.length) / limit)
          : Math.ceil(((page - 1) * limit + transformedData.length) / limit),
        page,
        limit,
        // hasMore: stripeRefunds.has_more,
        // startingAfter: stripeRefunds.data[0]?.id,
        // endingBefore: stripeRefunds.data[stripeRefunds.data.length - 1]?.id,
      },
      result: transformedData,
    };
  }

  /**
   * Creates a searchable string from multiple fields of a Stripe refund object.
   * This is useful for searching refunds by their fields.
   * @param refund - The Stripe refund object to generate a searchable string from.
   * @returns A searchable string containing the fields of the refund object.
   */
  private generateSearchableText(refund: Stripe.Refund): string {
    // Create a searchable string from multiple fields
    const searchFields = [
      refund.id,
      refund.charge,
      refund.payment_intent,
      refund.balance_transaction,
      refund.receipt_number,
      refund.status,
      refund.reason,
      `$${(refund.amount / 100).toFixed(2)}`,
      refund.currency?.toUpperCase(),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchFields;
  }

  /**
   * Applies a search filter to a list of refunds.
   * @param refunds - The list of refunds to apply the search filter to.
   * @param q - The search query to filter the refunds by.
   * @returns A new list of refunds filtered by the search query.
   */
  private applySearchFilter(refunds: any, q: string): any {
    const searchLower = q.toLowerCase();

    const filteredData = refunds.data.filter((refund: any) => {
      const searchableText = this.generateSearchableText(refund);
      return searchableText.includes(searchLower);
    });

    return {
      ...refunds,
      data: filteredData,
    };
  }

  // List all available payment methods for a country
  async getAvailablePaymentMethods(countryCode: string = "US") {
    // This helps you show expected payment methods to users
    const paymentMethods = {
      card: ["visa", "mastercard", "amex", "discover"],
      alipay: ["cn"],
      wechat_pay: ["cn"],
      ideal: ["nl"],
      sofort: ["de", "at"],
      giropay: ["de"],
      bancontact: ["be"],
      eps: ["at"],
      p24: ["pl"],
      // Add more as needed
    };

    return paymentMethods;
  }
}

export default PaymentService;
