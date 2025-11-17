import Stripe from "stripe";
import env from "./clean-env";

const stripeSecretKey = env.STRIPE_SECRET_KEY;
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
