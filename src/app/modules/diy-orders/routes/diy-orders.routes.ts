import { Router } from "express";
import { fileUploader } from "../../../../lib/utils/file-uploader";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { diyOrderController } from "../controller/diy-orders.controller";
import { diyOrderValidation } from "../validation/diy-orders.validation";

const router = Router();

router
  .route("/")
  .post(
    authenticate,
    fileUploader.uploadSingle,
    sanitizeInputData(diyOrderValidation.createNewDiyOrderSchema),
    diyOrderController.createNewDiyOrder,
  )
  .get(authenticate, diyOrderController.getAllDiyOrders);

//.get(diyOrderController.getAllDiyOrders);

// ** Get, update, delete specific DIY order
// router
//   .route("/:id")
//   .get(diyOrderController.getSingleDiyOrder)
//   .patch(
//     sanitizeInputData(diyOrderValidation.updateDiyOrderSchema),
//     diyOrderController.updateDiyOrder,
//   )
//   .delete(diyOrderController.deleteDiyOrder);

export const DiyOrderRoutes = router;
