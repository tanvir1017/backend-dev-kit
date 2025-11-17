import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { wareHouseController } from "../controller/warehouse-management.controller";
import { wareHouseValidation } from "../validation/warehouse-management.validation";

const router = Router();

// ** get all warehouses
router.route("/").get(authenticate, wareHouseController.getAllWarehouse);

// ** get single warehouse
router
  .route("/:name")
  .get(authenticate, wareHouseController.getSingleWarehouse);

// ** get shelves by warehouse id
router
  .route("/shelves/:warehouse_id")
  .get(authenticate, wareHouseController.getShelvesByWarehouseId);

// ** get storage by shelves id
router
  .route("/storage/:shelves_id")
  .get(authenticate, wareHouseController.getStorageByShelveId);

// ** crete new warehouse
router
  .route("/create")
  .post(
    authenticate,
    sanitizeInputData(wareHouseValidation.newWarehouseSchema),
    wareHouseController.createNewWarehouse,
  );

// ** CRUD operations for storage
router
  .route("/get-storage/:storageId")
  .get(authenticate, wareHouseController.getSingleStorageInfo);

// ** Update storage info
router
  .route("/update-storage/:storageId")
  .patch(
    authenticate,
    sanitizeInputData(wareHouseValidation.updateStorageSchema),
    wareHouseController.updateStorageInfo,
  );

export const WarehouseRoutes = router;
