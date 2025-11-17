import { Router } from "express";
import { fileUploader } from "../../../../../lib/utils/file-uploader";
import { authenticate, requirePermission } from "../../../../middleware/auth";
import parseBodyData from "../../../../middleware/parse-bodyData";
import sanitizeInputData from "../../../../middleware/sanitizeClientDataViaZod";
import ProductController from "../controller/products.controller";
import { productValidation } from "../validation/products.validation";

const productController = new ProductController();
const router = Router();

// Retrieve all the product for purchasing agent
router.route("/p_a_or_w_s/get-all-products").get(
  // authenticate first
  authenticate,
  // check the access control
  requirePermission("PRODUCT_LIST"),
  productController.allProduct,
);

/////////////////////////////////////////////////
/*  Purchasing agent */
/////////////////////////////////////////////////
// Retrieve all the product for purchasing agent
router.route("/change-status").patch(
  // authenticate first
  authenticate,
  sanitizeInputData(productValidation.changeProductStatus),
  productController.changeProductStatus,
);

/////////////////////////////////////////////////
/*  Warehouse Stuff */
/////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////
// _> Qc Details ~ Modules
//////////////////////////////////////////////////////////////////////////////////////////
// Create qc details
router.route("/add-qc").post(
  // authenticate first
  authenticate,
  // check the access control
  requirePermission("QC_DETAILS"),
  // upload multiple files
  fileUploader.uploadMultiple({ imageName: "images" }),

  // parsing body data into json
  parseBodyData,
  // sanitize the data
  sanitizeInputData(productValidation.qcDetails),
  productController.addQc,
);

// Update qc existing details
router.route("/update-qc/:qcId").patch(
  // authenticate first
  authenticate,
  // check the access control
  requirePermission("QC_DETAILS"),
  // upload multiple files
  fileUploader.uploadMultiple({ imageName: "images" }),
  // parsing body data into json
  //parseBodyDataInUpdatableRoutes, // for update able router handler

  // sanitize the data
  sanitizeInputData(productValidation.updateQcDetailsSchema),
  productController.updateQc,
);

// Delete qc details
router.route("/delete-qc/:qcId").delete(
  // authenticate
  authenticate,
  // check the access control
  requirePermission("QC_DETAILS"),
  productController.deleteQcDetails,
);

// Delete qc photos details
router.route("/delete-qc-photos").delete(
  // authenticate first
  authenticate,
  // check the access control
  requirePermission("QC_DETAILS"),
  productController.deleteQcPhotos,
);

export const ProductsRoutes = router;
