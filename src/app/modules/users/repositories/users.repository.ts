import prisma from "@/lib/prisma";
import type { User } from "@prisma/index";
import type { I_UserRepository } from "../interface/user.interfaces";

export class UserRepository implements I_UserRepository {
  async createUser(userData: User): Promise<User> {
    return prisma.user.create({ data: userData });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
