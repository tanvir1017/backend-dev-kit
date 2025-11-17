import { PaymentStatus } from "@prisma/client";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";

export interface I_CreateCheckoutSessionProps {
  user: I_GlobalJwtPayload;
  orderId: string;
  isUseCustomerBalance: "true" | "false";
}

export interface I_CheckoutSessionResponse {
  sessionId: string;
  url: string; // The checkout page URL
}

export interface I_LineItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      description?: string;
      images?: string[];
    };
    unit_amount: number; // in cents
  };
  quantity: number;
}

export interface I_RefundPayload {
  userId: string;
  amount: number;
  reason: string;
  paymentId: string;
  stripeChargeId: string;
}
export interface I_RefundListParams {
  page: number;
  limit: number;
  status?: string;
  q?: string;
  starting_after?: string;
  ending_before?: string;
}

export type T_payments = {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  stripeChargeId: string;
  amountTotal: number;
  currency: string;
  status: PaymentStatus;
};

export type T_OrderMetaType = {
  type: "ORDER_PAYMENT" | "SHIPPING_COST";
};
