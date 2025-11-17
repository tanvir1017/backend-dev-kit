import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import AddressController from "../controller/address-management.controller";

const addressController = new AddressController();
const router = Router();

// // ** Get user addresses
// router.route("/user/:userId").get(
//   // authenticate first
//   authenticate,
//   addressController.getUserAddresses,
// );

// ** Get single address
router.route("/address/:addressId").get(
  // authenticate first
  authenticate,
  addressController.getAddress,
);

// // ** Update address
// router.route("/:addressId").patch(
//   // authenticate first
//   authenticate,

//   // sanitize the data
//   sanitizeInputData(addressReqDataValidation.update),
//   addressController.updateAddress,
// );

// // ** Delete address
// router.route("/:addressId").delete(
//   // authenticate first
//   authenticate,
//   addressController.deleteAddress,
// );

// // ** Set address as default
// router.route("/:addressId/set-default").patch(
//   // authenticate first
//   authenticate,
//   addressController.setDefaultAddress,
// );

export const AddressRoutes = router;
