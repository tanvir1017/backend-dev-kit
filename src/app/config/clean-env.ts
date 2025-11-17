import dotenv from "dotenv";
import { cleanEnv, num, str } from "envalid";
import path from "path";

// Declaring path for specific .env files
dotenv.config({ path: path.join(process.cwd(), ".env") });

const env = cleanEnv(process.env, {
  DEV_CLIENT_URL: str(),
  PROD_CLIENT_URL: str(),
  LOCAL_BACKEND_URL: str(),
  PROD_BACKEND_URL: str(),

  // App configuration with default users setup
  PORT: num(),
  ADMIN_EMAIL: str(),
  ADMIN_PASSWORD: str(),

  // JWT encryptions
  BCRYPT_SALT_ROUNDS: num(),
  JWT_ACCESS_EXPIRES_IN: str(),
  JWT_REFRESH_EXPIRES_IN: str(),
  JWT_PASSWORD_RESET_EXPIRES_IN: str(),
  JWT_OTP_EXPIRES_IN: str(),
  JWT_EMAIL_VERIFICATION_EXPIRES_IN: str(),
  JWT_ACCESS_TOKEN: str(),
  JWT_REFRESH_TOKEN: str(),
  JWT_PASSWORD_RESET_TOKEN: str(),
  JWT_EMAIL_VERIFICATION_TOKEN: str(),
  JWT_OTP_TOKEN: str(),

  // Database uri string
  DATABASE_URL: str(),

  // Taobao setup
  TAOBAO_API: str(),
  TAOBAO_API_KEY: str(),
  TAOBAO_API_SECRET: str(),

  // Stripe
  STRIPE_SECRET_KEY: str(),
  STRIPE_SECRET_KEY_LIVE: str(),
  PUBLISHABLE_STRIPE_SECRET_KEY: str(),
  STRIPE_WEB_HOOK_SECRET_KEY: str(),
  STRIPE_WEB_HOOK_SECRET_KEY_TERMINAL: str(),

  // SMTP setup
  SMTP_HOST: str(),
  SMTP_PORT: num(),
  SMTP_USER: str(),
  SMTP_PASS: str(),
  TRANSPORT_EMAIL: str(),

  // Digital ocean
  DO_SPACE_ENDPOINT: str(),
  DO_SPACE_ACCESS_KEY: str(),
  DO_SPACE_SECRET_KEY: str(),
  DO_SPACE_BUCKET: str(),

  // Open Fga
  FGA_API_SCHEME: str(),
  FGA_API_HOST: str(),
  FGA_API_PORT: str(),
  FGA_STORE_ID: str(),
  FGA_AUTHORIZATION_MODEL_ID: str(),

  // Redis
  REDIS_URL: str(),
  REDIS_PASSWORD: str(),
  REDIS_PROT: num(),

  // Meili
  MEILI_HOST: str(),
  MEILI_MASTER_KEY: str(),

  // Google oAuth2.0
  GOOGLE_CLIENT_ID: str(),
  GOOGLE_CLIENT_SECRET: str(),
});

export default env;
