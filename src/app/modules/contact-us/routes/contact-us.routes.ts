import { Router } from "express";
import { authenticate, requirePermission } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { contactUsController } from "../controller/contact-us.controller";
import { contactUsValidation } from "../validation/contact-us.validation";

const router = Router();

// retrieve all contact-us
router.route("/").get(
  authenticate,
  // requirePermission("CONTACT_US"),
  contactUsController.getAllContactUs,
);

// get contact us by id
router.route("/:id").get(
  authenticate,
  // requirePermission("CONTACT_US"),
  contactUsController.getContactUsById,
);

// create new contact us
router
  .route("/create")
  .post(
    sanitizeInputData(contactUsValidation.create),
    contactUsController.createNewContactUs,
  );

// update contact us status
router.route("/:id/status").patch(
  authenticate,
  // requirePermission("CONTACT_US"),
  sanitizeInputData(contactUsValidation.updateStatusSchema),
  contactUsController.updateContactUsStatus,
);

// search contact us
router
  .route("/search")
  .post(
    authenticate,
    requirePermission("CONTACT_US"),
    contactUsController.searchContactUs,
  );

// Delete contact us record
router.route("/:id/delete").delete(
  authenticate,
  // requirePermission("CONTACT_US"),
  contactUsController.deleteContactUs,
);
export const contactUsRoutes = router;
