import { User, UserRole } from "@prisma/client";
import { HttpStatusCode } from "axios";
import env from "../../app/config/clean-env";
import AppError from "../../app/errors/appError";
import { openFGAService } from "../../app/modules/openFGA/service/openFGA.service";
import { hashPwd } from "./encryption";
import { generateMemberId } from "./gen-member-id";
import prisma from "./prisma.utils";

///////////////////////// Types /////////////////////////
type T_SuperAdminInfo = Pick<
  User,
  "email" | "password" | "role" | "isVerified"
>;
/////////////////////////////////////////////////////

const seedSuperAdmin = async () => {
  // when database is connected, we will check who is super admin
  const admin = await prisma.user.findFirst({
    where: {
      email: env.ADMIN_EMAIL,
      role: UserRole.SUPER_ADMIN, // SUPER_ADMIN
    },
  });

  // also check here that admin has all the permissions, if there is need to be filtered out then filter them and only set the permission again

  if (!admin) {
    console.log("🌱 Granting all permissions to super admin...");
    const isWrote = await openFGAService.initializeSystem();

    if (isWrote.writes) {
      console.log(
        "🔍 No super admin found, Creating a new super admin by seeding new one..",
      );
      const adminObjReplica = {
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        role: UserRole.SUPER_ADMIN, // SUPER_ADMIN
        isVerified: true,
      };

      // add this created user to admin group
      try {
        let { password, ...rest } = adminObjReplica;
        password = await hashPwd(password); // hashing password

        const superAdmin = await prisma.user.create({
          data: {
            ...rest,
            lastPasswordChangedAt: new Date(),
            password,
            memberId: generateMemberId("admin"),
          },
        });
        await openFGAService.addUserToGroup(superAdmin.id, "SUPER_ADMINS");
        console.log(
          `✨ Permission granted to ${superAdmin.email} successfully`,
        );
      } catch (error) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          `${(error as Error).message || "Something went very bad!"} `,
        );
      }
    }
  }
};

export default seedSuperAdmin;
