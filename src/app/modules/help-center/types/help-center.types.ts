import { z } from "zod";
import { helpCenterInfoValidator } from "../validation/help-center.validation";

export type T_UpdateHelpCenter = z.infer<
  typeof helpCenterInfoValidator.updateHelpCenterInfoSchema
>["body"];
