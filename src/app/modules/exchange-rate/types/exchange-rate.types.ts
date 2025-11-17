import zod from "../../../../lib/zod";
import { exchangeRateValidation } from "../validation/exchange-rate.validation";
export type T_CreateExchangeRateInput = zod.infer<
  typeof exchangeRateValidation.create.shape.body
>;

export type T_UpdateExchangeRate = zod.infer<
  typeof exchangeRateValidation.update
>;
