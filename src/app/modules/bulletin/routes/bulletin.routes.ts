import { Router } from "express";
import { bulletinController } from "../controller/bulletin.controller";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { bulletinValidation } from "../validation/bulletin.validation";

const router = Router();

// ** get all bulletin
router.route("/").get(bulletinController.getAllBulletin);

// ** get single bulletin
router.route("/:id").get(bulletinController.getSingleBulletin);

// ** create new bulletin
router
  .route("/")
  .post(
    sanitizeInputData(bulletinValidation.createNewBulletinSchema),
    bulletinController.createNewBulletin,
  );

// ** update bulletin
router
  .route("/:id")
  .patch(
    sanitizeInputData(bulletinValidation.updateBulletinSchema),
    bulletinController.updateBulletin,
  );

// ** delete bulletin
router.route("/:id").delete(bulletinController.deleteBulletin);

export const BulletinRouter = router;
