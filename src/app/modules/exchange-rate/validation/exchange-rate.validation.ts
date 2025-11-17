import { z } from "zod";
import { countryCodeEnum } from "../../../constant";

const createExchangeRateSchema = z.object({
  body: z
    .object({
      from: countryCodeEnum,
      to: countryCodeEnum,
      rate: z.number().positive(), // e.g. 7.18
    })
    .strict(),
});

const updateExchangeRateSchema = z.object({
  body: z
    .object({
      from: countryCodeEnum.optional(),
      to: countryCodeEnum.optional(),
      rate: z.number().positive().optional(), // e.g. 7.18
    })
    .strict(),
});

export const exchangeRateValidation = {
  create: createExchangeRateSchema,
  update: updateExchangeRateSchema,
};
