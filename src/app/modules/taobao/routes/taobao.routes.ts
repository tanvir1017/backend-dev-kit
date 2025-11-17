import { Router } from "express";
import { upload } from "../../../../lib/utils/file-uploader";
import { taobaoController } from "../controller/taobao.controller";

const router = Router();

// Get single item
router.route("/item_get").get(taobaoController.itemGet);
// Get similar items
router.route("/item_get_similar").get(taobaoController.itemGetSimilar);

// Search products
router.route("/item_search").get(taobaoController.searchProducts);

// Search products
router.route("/item_search_img").post(
  upload.single("image"),
  //multerUpload("search").single("image"),
  taobaoController.searchProductByImageId,
);

// Get area
//router.route("/get-area").get(taobaoController.getAreas);

// Delivery fee
router.route("/item_fee").get(taobaoController.itemFee);

export const taobaoRoutes = router;
