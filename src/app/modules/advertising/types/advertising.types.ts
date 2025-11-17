import { z } from "zod";
import { advertisingValidation } from "../validation/advertising.validation";

export type T_UpdateAdvertising = z.infer<
  typeof advertisingValidation.updateAdvertisingSchema
>["body"];
