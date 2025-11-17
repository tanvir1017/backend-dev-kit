import {
  OrderStatus,
  PackageStatus,
  PaymentStatus,
  ProductStatus,
} from "@prisma/client";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../../../../lib/utils/prisma.utils";
import sendResponse from "../../../../lib/utils/sendResponse";
import AppError from "../../../errors/appError";
import PackageRepo from "../../dashboard/packages/repository/packages.repository";
import { orderRepository } from "../../orders/repository/orders.repository";
import { paymentRepository } from "../../payment/repository/payment.repository";
import CurrencyConverter from "../../payment/utils/CurrencyConversion.utils";
import { TOPUP_CONSTANT } from "../../top-up/constant/top-up.constant";
import { userRepository } from "../../user-account/user/repository/user.repository";
import { I_P_PurchaseCheckoutSessionMeta } from "../types/stripe.types";
import {
  BASE_STRIPE_SECRET_KEY,
  BASE_STRIPE_WEB_HOOK_SECRET_KEY,
} from "../utils/local-and-prod-env.utils";

export class StripeWebhookService {
  private stripe: Stripe;
  private webhookSecret: string;
  private pkgRepo: PackageRepo;

  constructor() {
    this.stripe = new Stripe(BASE_STRIPE_SECRET_KEY);
    this.webhookSecret = BASE_STRIPE_WEB_HOOK_SECRET_KEY;
    this.pkgRepo = new PackageRepo();
  }

  /**
   * Verify Stripe webhook signature
   */
  private verifyWebhookSignature(req: Request): Stripe.Event {
    const signature = req.headers["stripe-signature"];

    if (!signature) {
      throw new AppError(
        HttpStatusCode.NotAcceptable,
        "No stripe-signature header found",
      );
    }

    try {
      return this.stripe.webhooks.constructEvent(
        req.body,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Webhook signature verification failed: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Main webhook handler
   */
  public async handleWebhook(req: Request, res: Response): Promise<void> {
    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.verifyWebhookSignature(req);
    } catch (error) {
      console.error("Webhook signature verification failed:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `==🐞== Webhook Error: ${(error as Error).message}`,
      );
    }

    try {
      // Handle different event types
      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;

          if (session?.metadata && session.metadata.type === "SHIPPING_COST") {
            await this.handleShippingCostCompleted(
              event.data.object as Stripe.Checkout.Session,
            );
            break;
          } else {
            await this.handleCheckoutSessionCompleted(
              event.data.object as Stripe.Checkout.Session,
            );
            break;
          }

        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          // Credit the customer's balance with the paid amount
          if (paymentIntent.metadata?.type === "topup") {
            await this.handlePaymentIntentSucceeded(paymentIntent);
          }
          break;

        case "setup_intent.succeeded":
          await this.handleSetupIntentSucceeded(
            event.data.object as Stripe.SetupIntent,
          );
          break;

        case "payment_intent.payment_failed":
          await this.handlePaymentIntentPaymentFailed(
            event.data.object as Stripe.PaymentIntent,
          );
          break;

        case "refund.updated":
          // console.dir(event, {
          //   depth: null,
          // });
          // const meta = event.data.object.metadata as {
          //   pkgId: string;
          //   paymentId: string;
          //   type: PaymentType;
          //   userId: string;
          //   reason: string;
          //   customer: string;
          // };

          await this.handleRefundUpdate(event);
          break;

        default:
          console.log(`==🪲==** Unhandled event type: ${event.type} **__`);
      }

      // Return success response
      sendResponse(res, {
        success: true,
        statusCode: HttpStatusCode.Ok,
        message: "Webhook processed successfully",
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `==🐞== Webhook Error: ${(error as Error).message}`,
      );
    }
  }

  /*
   *  Handle refund amount
   *
   */

  private async handleRefundUpdate(event: Stripe.Event) {
    const charge = event.data.object as Stripe.Refund;

    await prisma.refund.create({
      data: {
        stripeRefundId: charge.id,
        chargeId: charge.charge as string,
        amount: CurrencyConverter.toDollars(charge.amount),
        balanceTransactionId: (charge.balance_transaction as string) || null,
        currency: charge.currency,
        payment_intent: (charge.payment_intent as string) || null,
        status: charge.status as string,
      },
    });
  }

  /**
   * Handle completed checkout session
   */

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ) {
    try {
      const metadata =
        session.metadata as unknown as I_P_PurchaseCheckoutSessionMeta;

      // Then parse the JSON string
      const orderMetaData = JSON.parse(metadata.orderMetaData) as {
        orderId: string;
      };
      const orderId = orderMetaData.orderId; //
      const customerId = metadata.customer; //

      if (!orderId) {
        throw new AppError(
          HttpStatusCode.NotFound,
          "No orderId found in session metadata",
        );
      }

      // Transform Stripe session to your Prisma schema
      const { relationalId, userId, ...paymentData } =
        await this.transformStripeSessionToPayment(
          session,
          orderId,
          customerId,
        );

      // create payment record and update the order
      const createPaymentAndUpdateOrder = prisma.$transaction(async (tx) => {
        // Create payment record
        const createPayment = await paymentRepository.createPaymentRecord({
          payload: {
            ...paymentData,
            order: {
              connect: {
                id: relationalId,
              },
            },
            user: {
              connect: {
                id: userId,
              },
            },
            paymentType: "PRODUCT_ORDER",
          },
          tx,
        });

        // Update order status
        const updateOrderStatus = await orderRepository.updateOrder(
          {
            orderId: orderId,
            payload: {
              orderStatus: OrderStatus.PAID,
              productStatus: ProductStatus.PENDING_PURCHASE,
            },
          },
          tx,
        );

        return {
          payment: createPayment,
          order: updateOrderStatus,
        };
      });

      return createPaymentAndUpdateOrder;
    } catch (error) {
      console.error("Error handling checkout session completed:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `==🐞== Webhook Error: ${(error as Error).message}`,
      );
    }
  }

  // Handle the shipping cost checkout session response
  private async handleShippingCostCompleted(session: Stripe.Checkout.Session) {
    try {
      const metaData = session.metadata as unknown as {
        type: "SHIPPING_COST";
        packageId: string;
        userId: string;
      };

      /**
       *  We've to do few things her:
       * 01. With that information from stripe create a payment record
       * 02. Update the package if needed with the package id
       ** 2.1. --> Updated the status from `waiting for payment confirmation` to `processing in packing`e
       *
       */

      const { userId, relationalId, ...paymentPayload } =
        await this.transformStripeSessionToPayment(
          session,
          metaData.packageId,
          metaData.userId,
        );

      const shippingPayTransaction = await prisma.$transaction(async (tx) => {
        // Create payment record
        const createPayment = await paymentRepository.createPaymentRecord({
          payload: {
            ...paymentPayload,
            packages: {
              connect: {
                id: relationalId,
              },
            },
            user: {
              connect: {
                id: userId,
              },
            },
            paymentType: "SHIPPING_COST",
          },
          tx, // sharing the transaction client with the repository
        });

        // update the package
        const updatePackage = await this.pkgRepo.updatePackage({
          id: metaData.packageId,
          payload: {
            packageStatus: PackageStatus.PROCESS_IN_PACKING,
          },
          tx,
        });

        // update the user information with the new balance from the payment
        await userRepository.updateUserInfo(
          userId,
          { memberPoints: paymentPayload.amountTotal },
          tx,
        );

        return {
          payment: createPayment,
          package: updatePackage,
        };
      });

      return shippingPayTransaction;
    } catch (error) {
      console.error("Error handling checkout session completed:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `==🐞== Webhook Error: ${(error as Error).message}`,
      );
    }
  }
  /**
   * Handle payment failed
   */
  private async handlePaymentIntentPaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    try {
      const metadata =
        paymentIntent.metadata as unknown as I_P_PurchaseCheckoutSessionMeta;

      // Then parse the JSON string
      const orderMetaData = JSON.parse(metadata.orderMetaData) as {
        orderId: string;
      };
      const orderId = orderMetaData.orderId; //
      const customerId = metadata.customer; //

      if (!orderId) {
        throw new AppError(
          HttpStatusCode.NotFound,
          "No orderId found in session metadata",
        );
      }
    } catch (error) {
      console.error("Error handling payment failed:", error);
    }
  }

  /**
   * Handle setup intent succeeded - attach payment method to customer
   */
  private async handleSetupIntentSucceeded(setupIntent: Stripe.SetupIntent) {
    try {
      const { payment_method, customer, metadata } = setupIntent;

      if (!payment_method || !customer) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Missing payment_method or customer in setup intent",
        );
      }

      // 1. Attach payment method to customer
      await this.stripe.paymentMethods.attach(payment_method as string, {
        customer: customer as string,
      });

      console.log(
        `✅ Payment method ${payment_method} attached to customer ${customer}`,
      );

      // 2. If this was for top-up with card saving, process the payment
      if (
        metadata?.purpose === TOPUP_CONSTANT.TOP_UP_WITH_SAVE_CARD &&
        metadata?.amount &&
        metadata?.userId
      ) {
        await this.processTopUpAfterCardSave(
          customer as string,
          payment_method as string,
          parseInt(metadata.amount),
          metadata.userId,
        );
      }

      // // 3. Optional: Set as default payment method if it's the first card
      // await this.setAsDefaultIfFirstCard(
      //   customer as string,
      //   payment_method as string,
      // );
    } catch (error) {
      console.error("Error handling setup intent succeeded:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to handle setup intent: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Handle payment intent success
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ) {
    try {
      await this.stripe.customers.createBalanceTransaction(
        paymentIntent.customer as string,
        {
          amount: paymentIntent.amount_received,
          currency: paymentIntent.currency,
          description: "Top-Up Balance",
        },
      );
    } catch (error) {
      console.error("Error handling setup intent succeeded:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to handle setup intent: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Get webhook event for testing
   */
  public async constructTestEvent(
    payload: any,
    signature: string,
  ): Promise<Stripe.Event> {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.webhookSecret,
    );
  }

  // Helper function to transform Stripe session to your Prisma schema
  private async transformStripeSessionToPayment(
    session: Stripe.Checkout.Session,
    relationalId: string,
    userId: string,
  ) {
    const chargeId = await this.retrieveChargeId(
      session.payment_intent as string,
    );
    // Convert address to plain object
    const customerAddress = session.customer_details?.address
      ? {
          city: session.customer_details.address.city,
          country: session.customer_details.address.country,
          line1: session.customer_details.address.line1,
          line2: session.customer_details.address.line2,
          postal_code: session.customer_details.address.postal_code,
          state: session.customer_details.address.state,
        }
      : null;
    return {
      // Stripe Identifiers
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeChargeId: chargeId as string,

      // Payment amounts (convert from cents to dollars)
      amountSubtotal: CurrencyConverter.toDollars(session.amount_subtotal || 0),
      amountTotal: CurrencyConverter.toDollars(session.amount_total || 0),
      currency: session.currency?.toUpperCase() || "USD",
      status: this.mapStripeStatusToPaymentStatus(session.payment_status),
      paymentMethodTypes: session.payment_method_types || [],

      // Customer info (flattened for easier querying)
      customerEmail: session.customer_details?.email || null,
      customerName: session.customer_details?.name || null,
      customerAddress: customerAddress,

      // Session details
      mode: session.mode,
      sessionStatus: session.status || null,

      // Metadata (store entire object)
      metadata: session.metadata,

      // Relations
      relationalId,
      userId: userId,
    };
  }

  /**
   * Maps a Stripe status to a payment status
   * @param {string} stripeStatus - Stripe status
   * @returns {PaymentStatus} - Payment status
   */
  private mapStripeStatusToPaymentStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      paid: PaymentStatus.SUCCEEDED,
      payment_failed: PaymentStatus.FAILED,
      pending: PaymentStatus.PENDING,
      unpaid: PaymentStatus.PENDING,
    };

    return statusMap[stripeStatus] || PaymentStatus.PENDING;
  }

  /**
   * Process top-up payment after card is successfully saved
   */
  private async processTopUpAfterCardSave(
    customerId: string,
    paymentMethodId: string,
    amount: number,
    userId: string,
  ) {
    try {
      // Create payment intent with the saved card
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        customer: customerId,
        payment_method: paymentMethodId,
        off_session: false, // First time, customer is present via webhook flow
        confirm: true, // Auto-confirm since we have user consent
        metadata: {
          type: "topup",
          userId: userId,
          purpose: TOPUP_CONSTANT.TOP_UP_WITH_SAVE_CARD,
        },
      });
    } catch (error) {
      console.error("Error processing top-up after card save:", error);
      throw new AppError(
        HttpStatusCode.BadRequest,
        `Failed to process top-up: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Retrieve charge id by giving the payment intentId
   * @param {string} paymentIntent - Payment intent id
   * @returns {string} - Charge id
   */
  private async retrieveChargeId(paymentIntent: string) {
    try {
      const pIntent = await this.stripe.paymentIntents.retrieve(paymentIntent);
      return pIntent.latest_charge;
    } catch (error) {
      console.error("Error setting default payment method:", error);
    }
  }

  /**
   * Set payment method as default if it's the customer's first card
   */
  private async setAsDefaultIfFirstCard(
    customerId: string,
    paymentMethodId: string,
  ) {
    try {
      // Get all payment methods for this customer
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      // If this is the first card, set as default
      if (paymentMethods.data.length === 1) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
        console.log(
          `✅ Payment method ${paymentMethodId} set as default for customer ${customerId}`,
        );
      }
    } catch (error) {
      console.error("Error setting default payment method:", error);
      // Don't throw error here - this is optional functionality
    }
  }
}
