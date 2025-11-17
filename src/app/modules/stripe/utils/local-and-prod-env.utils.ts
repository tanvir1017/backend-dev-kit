import env from "../../../config/clean-env";

export const BASE_STRIPE_WEB_HOOK_SECRET_KEY = env.isProd
  ? env.STRIPE_WEB_HOOK_SECRET_KEY
  : env.STRIPE_WEB_HOOK_SECRET_KEY_TERMINAL;

export const BASE_STRIPE_SECRET_KEY = env.isProd
  ? env.STRIPE_SECRET_KEY_LIVE
  : env.STRIPE_SECRET_KEY;
