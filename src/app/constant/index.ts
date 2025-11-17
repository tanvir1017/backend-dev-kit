import { countries, TCountryCode } from "countries-list";
import zod from "../../lib/zod";

export enum E_ASSETS_PARENT_FOLDER_NAME {
  MITYAHUANG = "mityahuang",
}
export type T_ASSETS_UPLOAD_FOLDER_NAME =
  | "users"
  | "taobao"
  | "qc-images"
  | "search"
  | "social-media"
  | "blogs"
  | "advertising"
  | "whatsapp-contact-image";

export const allowedTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export enum E_AllowedHeaders {
  X_CLIENT_SOURCE = "x-client-source",
}

export const countryCodeEnum = zod
  .enum(Object.keys(countries) as [TCountryCode, ...TCountryCode[]])
  .describe("Invalid country code provided.");
