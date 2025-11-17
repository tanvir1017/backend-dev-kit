import { Router } from "express";
import { fileUploader } from "../../../../lib/utils/file-uploader";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { advertisingController } from "../controller/advertising.controller";
import { advertisingValidation } from "../validation/advertising.validation";

const router = Router();

// ** get advertising
router.route("/").get(advertisingController.getAdvertising);

// ** update advertising
router
  .route("/")
  .patch(
    fileUploader.uploadSingle,
    sanitizeInputData(advertisingValidation.updateAdvertisingSchema),
    advertisingController.updateAdvertising,
  );

export const AdvertisingRoutes = router;
