import express from "express";
import { authenticate, requirePermission } from "../../../../middleware/auth";
import sanitizeInputData from "../../../../middleware/sanitizeClientDataViaZod";
import PackageController from "../controller/packages.controller";
import { pkgValidation } from "../validation/packages.validation";

const router = express.Router();
const pkgController = new PackageController();

// Order payment checkout-session ~ when any user wants to place any order
router.get(
  "/get-packages",
  authenticate,
  requirePermission("PACKAGE_LIST"),
  pkgController.getAllThePackages,
);

// Assign warehouse stuff to a package to handle the pkg qc details
router.patch(
  "/assign-ws-pa",
  authenticate,
  sanitizeInputData(pkgValidation.addWsOrPA),
  pkgController.assignWsOrPa,
);

// Update package details qc information
router.put(
  "/update-package-qc-details",
  authenticate,
  requirePermission("PACKAGE_DETAILS"),
  sanitizeInputData(pkgValidation.updatePkgQcDetails),
  pkgController.updateOrCreatePackageQcDetails,
);

// Order payment checkout-session ~ when any user wants to place any order
router.get(
  "/:pkgId/get-package",
  authenticate,
  //requirePermission("PACKAGE_LIST"),
  pkgController.getSingleInformation,
);

// Update package information
router.patch(
  "/:pkgId/update-package",
  authenticate,
  sanitizeInputData(pkgValidation.updatePkgQcInfo),
  // requirePermission("PACKAGE_LIST"),
  pkgController.updatePackageDetails,
);
export const pkgRouter = router;
