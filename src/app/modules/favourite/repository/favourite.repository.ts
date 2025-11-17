import { Prisma } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

class FavRepo {
  constructor() {}

  // Create favorite
  async createFavorite<T extends Prisma.FavoritesCreateArgs>(payload: T) {
    return prisma.favorites.create(payload);
  }

  // Delete favorite
  async deleteFavorite<T extends Prisma.FavoritesDeleteArgs>(payload: T) {
    return prisma.favorites.delete(payload);
  }
  // Get all favorites with flexible query
  async getAllFavorites<T extends Prisma.FavoritesFindManyArgs>(payload: T) {
    return prisma.favorites.findMany(payload) as Promise<
      Prisma.FavoritesGetPayload<T>[]
    >;
  }

  // Get favorites for individual user
  async getAllFavoritesByUserId<T extends Prisma.FavoritesFindManyArgs>(
    payload: T,
  ) {
    return prisma.favorites.findMany(payload) as Promise<
      Prisma.FavoritesGetPayload<T>[]
    >;
  }
}

export const favRepo = new FavRepo();
