import { Router } from "express";
import { faqController } from "../controller/faq.controller";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { faqValidationSchema } from "../validation/faq.validation";

const router = Router();

// ** get all faq
router.route("/").get(faqController.getAllFAQ);

// ** get single faq
router.route("/:id").get(faqController.getSingleFAQ);

// ** create faq
router
  .route("/")
  .post(
    sanitizeInputData(faqValidationSchema.newFAQSchema),
    faqController.createFAQ,
  );

// ** update faq
router
  .route("/:id")
  .patch(
    sanitizeInputData(faqValidationSchema.updateFAQSchema),
    faqController.updateFAQ,
  );

// ** delete faq
router.route("/:id").delete(faqController.deleteFAQ);

export const FAQRoutes = router;
