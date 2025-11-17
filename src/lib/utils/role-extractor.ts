import { UserRole } from "@prisma/client";

export function roleExtractor(role: UserRole) {
  switch (role) {
    case "WAREHOUSE_STAFF":
      return "Warehouse Staff";
    case "PURCHASING_AGENT":
      return "Purchasing Agent";
    case "ADMIN":
      return "Admin";
    case "SUPER_ADMIN":
      return "Super Admin";
    default:
      return "Member";
  }
}
