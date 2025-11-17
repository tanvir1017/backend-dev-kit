import { Router } from "express";

import { authenticate, requirePermission } from "../../../../middleware/auth";
import sanitizeInputData from "../../../../middleware/sanitizeClientDataViaZod";
import { userControllers } from "../controller/user.controller";
import { userReqDataValidation } from "../validation/user.validation";

const router = Router();

// Retrieve all the user from db
router
  .route("/")
  .get(
    authenticate,
    requirePermission("USER_DETAILS"),
    userControllers.getAllUsers,
  );

// Retrieve logged in user information
router.route("/me").get(authenticate, userControllers.getMe);

// Create a user
router
  .route("/create")
  .post(
    sanitizeInputData(userReqDataValidation.create),
    userControllers.createUser,
  );

// Update user information only
// router
//   .route("/update-user-info/:userId")
//   .patch(
//     sanitizeInputData(userReqDataValidation.update),
//     userControllers.updateUser,
//   );

// Update user role
router
  .route("/update-role")
  .patch(
    sanitizeInputData(userReqDataValidation.roleUpdate),
    userControllers.changeRole,
  );

// Change the password
router
  .route("/change-pwd")
  .patch(
    authenticate,
    sanitizeInputData(userReqDataValidation.changePwd),
    userControllers.changePwd,
  );

// delete user
router.route("/:userId/delete").delete(userControllers.deleteUser);

/////////////////////////////////////////////////
/*  Dynamic routes */
/////////////////////////////////////////////////
// Retrieve user by its email
router.route("/email/:email").get(
  //authGuard("SUPER_ADMIN", "ADMIN"),
  userControllers.getSingleUserByMail,
);

// Retrieve single users by its id
router.route("/:id").get(
  //authGuard("SUPER_ADMIN", "ADMIN"),
  userControllers.getSingleUser,
);

/////////////////////////////////////////////////
/*  Profile routes */
/////////////////////////////////////////////////

/////////////////////////////////////////////////
/*  Address routes */
/////////////////////////////////////////////////

/////////////////////////////////////////////////
/*  Payment password */

router
  .route("/update-payment-pwd")
  .patch(authenticate, userControllers.updatePaymentPwd);

router
  .route("/forget-payment-pwd")
  .patch(authenticate, userControllers.forgetPaymentPwd);

/////////////////////////////////////////////////

export const UserRoutes = router;
