import { PA_WA_Stuffs, PrismaClient } from "@prisma/client";
import prisma from "../../../../../lib/utils/prisma.utils";
import { T_PrismaModelOmittedProp } from "../../../../interface/common.interface";
import { I_AssignWSProps } from "../types/assign-pa.types";

class AssignPA {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prisma;
  }

  // Assign purchasing agent
  async assignPA(
    payload: Omit<PA_WA_Stuffs, T_PrismaModelOmittedProp | "wareHouseStuffId">,
  ) {
    return await this.prisma.pA_WA_Stuffs.create({
      data: payload,
    });
  }

  // Assign warehouse stuff
  async assignWS(payload: Omit<I_AssignWSProps, "user">) {
    const { orderId, warehouseStuffId } = payload;
    return await this.prisma.pA_WA_Stuffs.update({
      where: {
        orderId: orderId,
      },
      data: {
        wareHouseStuffId: warehouseStuffId,
      },
    });
  }
}

export default AssignPA;
