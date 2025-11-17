import { HttpStatusCode } from "axios";
import Stripe from "stripe";
import AppError from "../../../errors/appError";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import CurrencyConverter from "../../payment/utils/CurrencyConversion.utils";
import {
  BASE_STRIPE_SECRET_KEY,
  BASE_STRIPE_WEB_HOOK_SECRET_KEY,
} from "../../stripe/utils/local-and-prod-env.utils";
import { userRepository } from "../../user-account/user/repository/user.repository";

class TopUpService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    this.stripe = new Stripe(BASE_STRIPE_SECRET_KEY);
    this.webhookSecret = BASE_STRIPE_WEB_HOOK_SECRET_KEY;
  }

  // Top up customer balance
  public async createTopUpAndSavePaymentInfo({
    user,
    topUpAmount,
  }: {
    user: I_GlobalJwtPayload;
    topUpAmount: number;
  }) {
    if (topUpAmount <= 0) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "Amount must be greater than 0",
      );
    }

    const { id } = user;
    // Get user from database
    const getUser = await userRepository.getUserById(id);

    if (!getUser) {
      throw new AppError(HttpStatusCode.NotFound, "User not found");
    }

    // check if there is any customer id is available or not
    let updatedUser = getUser;
    if (getUser.stripeCustomerId === null) {
      // create new customer
      const customer = await this.stripe.customers.create({
        email: getUser.email,
      });

      // update user information
      updatedUser = await userRepository.updateUserInfo(id, {
        stripeCustomerId: customer.id,
      });
    }

    // Create SetupIntent to save card
    if (!updatedUser.stripeCustomerId) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Customer id not found for stripe!",
      );
    }

    try {
      const { client_secret: paymentIntent, id: paymentIntentId } =
        await this.stripe.paymentIntents.create({
          amount: CurrencyConverter.toCents(topUpAmount),
          currency: "usd",
          customer: updatedUser.stripeCustomerId,
          description: `Top up for user ${user.email}`,
          metadata: {
            userId: user.id,
            type: "topup",
          },
          // This will automatically add credit to customer balance
        });
      return {
        client_secret: paymentIntent,
        paymentIntentId,
      };
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error creating top up: ${(error as Error).message}`,
      );
    }
  }

  // Get user balance
  public async getUserBalance({
    user,
  }: {
    user: I_GlobalJwtPayload;
  }): Promise<{ balance: number; email: string; currency: string }> {
    const { id } = user;
    // Get user from database
    const getUser = await userRepository.getUserById(id);

    if (!getUser) {
      throw new AppError(HttpStatusCode.NotFound, "User not found");
    }

    if (!getUser.stripeCustomerId) {
      return {
        balance: 0,
        email: getUser.email,
        currency: "",
      };
    }

    try {
      const customer = await this.stripe.customers.retrieve(
        getUser.stripeCustomerId!,
      );

      /* 
        {
            id: 'cus_TAjYH4qfD4lZyw',
            object: 'customer',
            address: null,
            balance: 9998,
            created: 1759555953,
            currency: 'usd',
            default_source: null,
            delinquent: false,
            description: null,
            discount: null,
            email: 'developer.tanvirhossain@gmail.com',
            invoice_prefix: 'KNE9Q2SA',
            invoice_settings: {
              custom_fields: null,
              default_payment_method: null,
              footer: null,
              rendering_options: null
            },
            livemode: false,
            metadata: {},
            name: null,
            next_invoice_sequence: 1,
            phone: null,
            preferred_locales: [],
            shipping: null,
            tax_exempt: 'none',
            test_clock: null
          }
      */

      return {
        // @ts-ignore
        balance: customer.balance,
        // @ts-ignore
        email: customer.email,
        // @ts-ignore
        currency: customer.currency,
      };
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `Error creating top up: ${(error as Error).message}`,
      );
    }
  }
}
export default TopUpService;
