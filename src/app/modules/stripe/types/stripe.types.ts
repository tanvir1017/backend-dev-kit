export interface I_P_PurchaseCheckoutSessionMeta {
  orderMetaData: string;
  customer: string;
}

export interface I_StripeRefundListParams {
  limit: number;
  status?: string;
  q?: string;
  starting_after?: string;
  ending_before?: string;
}
