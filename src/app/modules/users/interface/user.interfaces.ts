import type { User } from "@prisma/index";

export interface I_UserRepository {
  findById(id: string): Promise<User | null>;
  createUser(userData: User): Promise<User>;
}
