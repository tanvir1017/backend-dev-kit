import { HttpStatusCode } from "axios";
import { urlFrontEnd } from "../../../../lib/utils/baseUrl";
import { stripe } from "../../../config/stripe";
import AppError from "../../../errors/appError";
import CurrencyConverter from "../../payment/utils/CurrencyConversion.utils";
import { I_StripeRefundListParams } from "../types/stripe.types";

export interface I_P_PurchaseCheckoutSession {
  line_items: any;
  isUseCustomerBalance?: "true" | "false";
  customerInfo: {
    userId: string;
    email: string;
  };
  orderMetaData: Record<string, any>;
}

class StripeRepository {
  // Create Stripe checkout session
  async createP_PurchaseCheckoutSession({
    line_items,
    customerInfo,
    orderMetaData,
    isUseCustomerBalance = "false",
  }: I_P_PurchaseCheckoutSession) {
    let customerBalance: any =
      isUseCustomerBalance === "true" ? ["customer_balance"] : "";
    return await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link", ...customerBalance],
      line_items: line_items,
      mode: "payment",
      success_url: `${urlFrontEnd}/success`,
      cancel_url: `${urlFrontEnd}/cancel-payment`,
      customer_email: customerInfo.email,
      metadata: {
        customer: customerInfo.userId,
        orderMetaData: JSON.stringify(orderMetaData),
      },
    });
  }

  async initializeRefundPayment(payload: {
    chargeId: string;
    amount: number;
    customerId: string;
    userId: string;
    orderId: string;
    paymentId: string;
    reason: string;
  }) {
    try {
      const initRefund = await stripe.refunds.create({
        charge: payload.chargeId,
        amount: payload.amount,
        metadata: {
          type: "REFUND_AMOUNT",
          userId: payload.userId, // user who will receive the amount
          orderId: payload.orderId,
          paymentId: payload.paymentId,
          customer: payload.customerId,
          reason: payload.reason,
        },
      });
      return initRefund;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to initialize refund: ${(error as Error).message}`,
      );
    }
  }

  // Shipping cost refund amount

  async initializeRefundPaymentForShipping(payload: {
    chargeId: string;
    amount: number;
    customerId: string;
    userId: string;
    pkgId: string;
    paymentId: string;
    reason: string;
  }) {
    try {
      const initRefund = await stripe.refunds.create({
        charge: payload.chargeId,
        amount: payload.amount,
        metadata: {
          type: "SHIPPING_REFUND_AMOUNT",
          userId: payload.userId, // user who will receive the amount
          pkgId: payload.pkgId,
          paymentId: payload.paymentId,
          customer: payload.customerId,
          reason: payload.reason,
        },
      });
      return initRefund;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to initialize refund: ${(error as Error).message}`,
      );
    }
  }

  async initializeShippingPayment(payload: {
    customerInfo: {
      userId: string;
      email: string;
    };
    pay: {
      cost: number;
      productId: string[];
    };

    orderMetaData: Record<string, any>;
  }) {
    try {
      const initShippingPay = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "link"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Shipping Fee (${payload.pay.cost}) USD For Order Of Total ${payload.pay.productId.length} Items`,
              },
              unit_amount: CurrencyConverter.toCents(payload.pay.cost),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${urlFrontEnd}/confirm-shipping/success`,
        cancel_url: `${urlFrontEnd}/confirm-shipping/cancel-payment`,
        customer_email: payload.customerInfo.email,
        metadata: payload.orderMetaData,
      });
      return initShippingPay;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to initialize shipping payment: ${(error as Error).message}`,
      );
    }
  }

  // Get the refund list

  async getRefundList(params: I_StripeRefundListParams) {
    try {
      const { limit, status, starting_after, q, ending_before } = params;

      const refundListParams: any = {
        limit: Math.min(limit, 100), // Stripe max limit is 100
      };

      // Add pagination cursors
      if (starting_after) {
        refundListParams.starting_after = starting_after;
      }

      if (ending_before) {
        refundListParams.ending_before = ending_before;
      }

      // Get refunds from Stripe
      const refunds = await stripe.refunds.list(refundListParams);

      // Client-side filtering for status (since Stripe API doesn't support status filter)
      let filteredRefunds = refunds;

      if (status) {
        filteredRefunds = {
          ...refunds,
          data: refunds.data.filter((refund) => refund.status === status),
        };
      }

      return filteredRefunds;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to retrieve refund list: ${(error as Error).message}`,
      );
    }
  }
}

export default StripeRepository;
