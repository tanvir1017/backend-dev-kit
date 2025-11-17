import { Router } from "express";
import { promotionLevelController } from "../controller/promotion-level.controller";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { promotionLevelValidation } from "../validation/promotion-level.validation";

const router = Router();

// ** get all promotional levels
router.route("/").get(promotionLevelController.getAllPromotionLevels);

// ** get single promotional level
router.route("/:id").get(promotionLevelController.getPromotionLevelById);

// ** get single promotional level
router
  .route("/:id")
  .patch(
    sanitizeInputData(promotionLevelValidation.updatePromotionalLevelSchema),
    promotionLevelController.updatePromotionalLevel,
  );

// ** create new promotional level
router
  .route("/")
  .post(
    sanitizeInputData(promotionLevelValidation.newPromotionalLevelSchema),
    promotionLevelController.createNewPromotionalLevel,
  );

// ** delete promotional level
router
  .route("/:id")
  .delete(promotionLevelController.deletePromotionLevelFromDb);

export const promotionLevelRouter = router;
