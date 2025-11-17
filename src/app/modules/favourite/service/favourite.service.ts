import { Favorites } from "@prisma/client";
import { HttpStatusCode } from "axios";
import {
  calculatePagination,
  I_PaginationOptions,
} from "../../../../lib/utils/calcPagination";
import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { globalRepository } from "../../global/repository/global.repository";
import { favRepo } from "../repository/favourite.repository";

class FavoriteService {
  constructor() {}

  // Create new favorite
  async createNewFavorite(payload: {
    taobao_num_iid: string;
    main_photo: string;
    title: string;
    descriptions: string;
    price: string;
    userId: string;
  }) {
    // Check if favorite already exists for this user
    const existingFavorite = await favRepo.getAllFavoritesByUserId({
      where: {
        userId: "68f4cf1667caca82f366eea5",
        taobao_num_iid: payload.taobao_num_iid,
      },
      select: { id: true },
    });
    console.log(
      "🚀 ~ FavoriteService ~ createNewFavorite ~ existingFavorite:",
      existingFavorite,
    );

    if (existingFavorite.length > 0) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "This product is already in your favorites",
      );
    }

    // Create new favorite
    return await favRepo.createFavorite({
      data: {
        taobao_num_iid: payload.taobao_num_iid,
        main_photo: payload.main_photo,
        title: payload.title,
        descriptions: payload.descriptions,
        price: payload.price,
        userId: "68f4cf1667caca82f366eea5",
      },
    });
  }
  // Delete favorite
  async deleteFavorite(favoriteId: string, userId: string) {
    // Verify favorite exists and belongs to user
    await this.getSingleFavorite(favoriteId, userId);

    return await favRepo.deleteFavorite({
      where: { id: favoriteId },
    });
  }

  // Get all favorites for user
  async getUserFavorites(
    query: I_PaginationOptions,
    userId: string,
  ): Promise<I_PaginationResponse<Favorites[]> | []> {
    const { limit, page, skip } = calculatePagination(query);

    const [result, totalCount] = await Promise.all([
      favRepo.getAllFavoritesByUserId({
        where: { userId },
        take: limit,
        skip,
      }),
      globalRepository.getCollectionCount({
        modelName: "Favorites",
        whereCondition: { userId },
      }),
    ]);
    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      result,
    };
  }

  // Get all favorites
  async getFavorites(
    query: I_PaginationOptions,
  ): Promise<I_PaginationResponse<Favorites[]>> {
    const { limit, page, skip } = calculatePagination(query);
    const [result, totalCount] = await Promise.all([
      favRepo.getAllFavorites({
        take: limit,
        skip,
      }),
      globalRepository.getCollectionCount({
        modelName: "Favorites",
        whereCondition: {},
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      result,
    };
  }

  // Get single favorite
  async getSingleFavorite(favoriteId: string, userId: string) {
    const favorites = await favRepo.getAllFavoritesByUserId({
      where: {
        id: favoriteId,
        userId: userId,
      },
    });

    if (favorites.length === 0) {
      throw new AppError(HttpStatusCode.NotFound, "Favorite not found");
    }

    return favorites[0];
  }
}

export const favoriteService = new FavoriteService();
