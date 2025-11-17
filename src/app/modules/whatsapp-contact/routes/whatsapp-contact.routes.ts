import { Router } from "express";
import { multerUpload } from "../../../middleware/multer";
import parseBodyData from "../../../middleware/parse-bodyData";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { whatsappContactController } from "../controller/whatsapp-contact.controller";
import { whatsappContactValidation } from "../validation/whatsapp-contact.validation";

const router = Router();

// ** retrieve whatsapp contact data
router.route("/").get(whatsappContactController.getWhatsappContact);

// ** retrieve whatsapp contact data

router
  .route("/")
  .patch(
    multerUpload("whatsapp-contact-image").single("image"),
    parseBodyData,
    sanitizeInputData(whatsappContactValidation.updateWhatsappContactSchema),
    whatsappContactController.updateWhatsappContact,
  );

export const whatsappContactRouter = router;
