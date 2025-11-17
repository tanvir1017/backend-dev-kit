import { Router } from "express";
import { authenticate, requirePermission } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { memberShipLevelController } from "../controller/membership-level.controller";
import { membershipLevelValidation } from "../validation/membership-level.validation";

const router = Router();

router
  .route("/")
  .post(
    authenticate,
    requirePermission("MEMBERSHIP_LEVEL"),
    sanitizeInputData(membershipLevelValidation.createNewInternshipLevelSchema),
    memberShipLevelController.createNewMembershipLevel,
  )
  .get(memberShipLevelController.getAllMembershipLevels);

// Get member ship management for users
router
  .route("/users")
  .get(
    authenticate,
    requirePermission("MEMBERSHIP_LEVEL"),
    memberShipLevelController.getUserMembershipLevel,
  );

// ** get or update membership level by id
router
  .route("/:id")
  .patch(
    authenticate,
    requirePermission("MEMBERSHIP_LEVEL"),
    sanitizeInputData(membershipLevelValidation.updateInternshipLevelSchema),
    memberShipLevelController.updateMembershipLevel,
  )
  .get(memberShipLevelController.getSingleMembershipLevel)
  .delete(
    authenticate,
    requirePermission("MEMBERSHIP_LEVEL"),
    memberShipLevelController.deleteMembershipLevel,
  );

export const MembershipLevelRoutes = router;
