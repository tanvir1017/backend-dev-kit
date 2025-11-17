import { z } from "zod";
import { socialMediaValidation } from "../validation/social-media.validation";

export type T_NewSocialMedia = z.infer<
  typeof socialMediaValidation.newSocialMediaSchema
>["body"] & {
  imageUrl: string;
};

export type T_UpdateSocialMedia = z.infer<
  typeof socialMediaValidation.updateSocialMediaSchema
>["body"] & {
  imageUrl?: string;
};
