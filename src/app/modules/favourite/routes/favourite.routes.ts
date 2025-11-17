import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { favoriteController } from "../controller/favourite.controller";
import { favoriteValidation } from "../validation/favourite.validation";

const router = Router();

router
  .route("/")
  .get(favoriteController.getAllFavorites)
  .post(
    sanitizeInputData(favoriteValidation.createNewFavoriteSchema),
    favoriteController.createNewFavorite,
  );

router
  .route("/user/:id")
  .get(authenticate, favoriteController.getUserFavorites)
  .delete(authenticate, favoriteController.deleteFavorite);

export const FavoriteRoutes = router;
