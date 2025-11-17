import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import asyncHandler from "../../../../lib/utils/async-handler";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { favoriteService } from "../service/favourite.service";

class FavoriteController {
  constructor() {}

  // Create new favorite
  createNewFavorite = async (req: Request, res: Response) => {
    const result = await favoriteService.createNewFavorite({
      ...req.body,
      userId: req.user?.id, // Assuming you have user in request from auth middleware
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Created,
      success: true,
      message: "Product added to favorites successfully",
      data: result,
    });
  };

  // Delete favorite
  deleteFavorite = async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    await favoriteService.deleteFavorite(id, userId!);

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Product removed from favorites successfully",
    });
  };

  // Get all favorites for logged in user
  getAllFavorites = asyncHandler(async (req: Request, res: Response) => {
    const result = await favoriteService.getFavorites(req.query);

    sendResponse(res, {
      success: true,
      message: "Favorites retrieved successfully",
      data: result,
      statusCode: HttpStatusCode.Ok,
    });
  });

  // Get single favorite
  getUserFavorites = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req.user as I_GlobalJwtPayload).id;
    const query = req.query as typeof req.query & I_PaginationOptions;

    const result = await favoriteService.getUserFavorites(query, userId);

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "Favorite retrieved successfully",
      data: result,
    });
  });
}

export const favoriteController = new FavoriteController();
