import { Router } from "express";

import { authenticate, requirePermission } from "../../../../middleware/auth";
import sanitizeInputData from "../../../../middleware/sanitizeClientDataViaZod";

import { dashboardUserControllers } from "../controller/dashboard-user.controller";
import { dashUserInputValidation } from "../validation/dashboard-user.validation";

const dashAuthRouter = Router();

// Retrieve all the user from db
// router.route("/").get(userControllers.getAllUsers);

// Retrieve all the user from db
//router.route("/me").get(authenticate, userControllers.getMe);

// manually reset password
dashAuthRouter.route("/login").post(dashboardUserControllers.login);

// Create a user
dashAuthRouter
  .route("/")
  //.get()
  .post(
    authenticate,
    requirePermission("USER_MANAGEMENT"),
    sanitizeInputData(dashUserInputValidation.dashUserSchema),
    dashboardUserControllers.createDashUser,
  );

// Update user information only
// router
//   .route("/update-user-info/:userId")
//   .patch(
//     sanitizeInputData(userReqDataValidation.update),
//     userControllers.updateUser,
//   );

// // Update user role
// router
//   .route("/update-role")
//   .patch(
//     sanitizeInputData(dashUserInputValidation.roleUpdate),
//     userControllers.changeRole,
//   );

// // Change the password
// router
//   .route("/change-pwd")
//   .patch(
//     authenticate,
//     sanitizeInputData(dashUserInputValidation.changePwd),
//     userControllers.changePwd,
//   );

// // delete user
// router.route("/:userId/delete").delete(userControllers.deleteUser);

// /////////////////////////////////////////////////
// /*  Dynamic routes */
// /////////////////////////////////////////////////
// // Retrieve user by its email
// router.route("/email/:email").get(
//   //authGuard("SUPER_ADMIN", "ADMIN"),
//   userControllers.getSingleUserByMail,
// );

// // Retrieve single users by its id
// router.route("/:id").get(
//   //authGuard("SUPER_ADMIN", "ADMIN"),
//   userControllers.getSingleUser,
// );

// /////////////////////////////////////////////////
// /*  Profile routes */
// /////////////////////////////////////////////////

// /////////////////////////////////////////////////
// /*  Address routes */
// /////////////////////////////////////////////////

// /////////////////////////////////////////////////
// /*  Payment password */

// router
//   .route("/update-payment-pwd")
//   .patch(authenticate, userControllers.updatePaymentPwd);

// router
//   .route("/forget-payment-pwd")
//   .patch(authenticate, userControllers.forgetPaymentPwd);

/////////////////////////////////////////////////

export const DashUserRoutes = dashAuthRouter;
