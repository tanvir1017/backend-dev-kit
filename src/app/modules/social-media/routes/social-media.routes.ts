import { Router } from "express";
import { fileUploader } from "../../../../lib/utils/file-uploader";
import { authenticate, requirePermission } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { socialMediaController } from "../controller/social-media.controller";
import { socialMediaValidation } from "../validation/social-media.validation";

const router = Router();

// ** get all social media
router
  .route("/")
  .get(socialMediaController.getAllSocialMedia)
  .post(
    authenticate,
    requirePermission("SOCIAL_MEDIA_MANAGEMENT"),
    fileUploader.uploadSingle,
    sanitizeInputData(socialMediaValidation.newSocialMediaSchema),
    socialMediaController.createSocialMedia,
  );

// ** get social media by id
router
  .route("/:id")
  .get(socialMediaController.getSocialMediaById)
  .patch(
    authenticate,
    requirePermission("SOCIAL_MEDIA_MANAGEMENT"),
    fileUploader.uploadSingle,
    sanitizeInputData(socialMediaValidation.updateSocialMediaSchema),
    socialMediaController.updateSocialMedia,
  )
  .delete(
    authenticate,
    requirePermission("SOCIAL_MEDIA_MANAGEMENT"),
    socialMediaController.deleteSocialMedia,
  );

export const SocialMediaRoutes = router;
