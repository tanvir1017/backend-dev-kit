import type { User } from "@prisma/client";
import { Elysia } from "elysia";
import { UserRepository } from "../repositories/users.repository";

export const userServicesV1 = new Elysia({ name: "Service.UserV1" })

  // Initialize UserRepository with state for dependency injection
  .state("userRepository", new UserRepository())

  // Define service methods
  .derive(({ store }) => ({
    // Get user by ID
    async getUserById(id: string) {
      const userRepo = store.userRepository;
      return userRepo.findById(id);
    },

    // Create a new user
    async createUser(data: User) {
      const userRepo = store.userRepository;
      return userRepo.createUser(data);
    },
  }))
  .as("global");
