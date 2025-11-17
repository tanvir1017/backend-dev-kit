import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { couponController } from "../controller/coupon-management.controller";
import { couponManagementValidation } from "../validation/coupon-management.validation";

const router = Router();

// ** get all coupon
router.route("/").get(couponController.getAllCoupon).post(
  authenticate,
  //requirePermission("COUPON_MANAGEMENT"),
  sanitizeInputData(couponManagementValidation.newCouponSchema),
  couponController.createNewCoupon,
);

// ** get Coupon by id
router
  .route("/:id")
  .get(couponController.getSingleCoupon)
  .patch(
    authenticate,
    //requirePermission("COUPON_MANAGEMENT"),
    sanitizeInputData(couponManagementValidation.updateCouponSchema),
    couponController.updateCoupon,
  )
  .delete(couponController.deleteCoupon);

export const CouponRoutes = router;
