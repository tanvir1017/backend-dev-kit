import { Order, ProductStatus, UserRole } from "@prisma/client";
import { HttpStatusCode } from "axios";
import AppError from "../../../../errors/appError";

import { userRepository } from "../../../user-account/user/repository/user.repository";
import OrderRepository from "../../products/repository/products.repository";
import AssignPA from "../repository/assign-pa.repository";
import { I_AssignPAProps, I_AssignWSProps } from "../types/assign-pa.types";

class AssignP_A_Service {
  private assignPARepository: AssignPA;
  private productRepository: OrderRepository;
  constructor() {
    this.assignPARepository = new AssignPA();
    this.productRepository = new OrderRepository();
  }

  // assign a new purchasing agent
  async assignPA(payload: I_AssignPAProps) {
    // step 01. Check if the user is admin
    if (
      ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(payload.user.role as any)
    ) {
      {
        throw new AppError(
          HttpStatusCode.Forbidden,
          "You are not authorized to perform this action!",
        );
      }
    }

    // step 02. Get the order first and verify it first
    const getOrder = await this.productRepository.getOrderById({
      orderId: payload.orderId,
      productStatus: "PENDING_PURCHASE",
    });

    if (!getOrder) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found!");
    }

    // step 03. Get the pa and verify it first
    const getPA = await userRepository.getUserByIdFromDB(
      payload.purchasingAgentId,

      {
        role: true,
        profile: {
          select: {
            firstName: true,
          },
        },
      },
    );

    if (!getPA) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Purchasing Agent not found!",
      );
    }

    if (getPA.role !== UserRole.PURCHASING_AGENT) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        `User: ${getPA.profile?.firstName + `. Id: ${payload.purchasingAgentId}` || ""} is not a purchasing agent! `,
      );
    }

    // step 04. Assign the pa
    return await this.assignPARepository.assignPA({
      orderId: payload.orderId,
      purchasingAgentId: payload.purchasingAgentId,
      remarks: payload.remarks,
    });
  }

  // assign a new Warehouse stuff
  async assignWS(payload: I_AssignWSProps) {
    // step 01. Check if the user is admin
    if (
      ![
        UserRole.ADMIN,
        UserRole.SUPER_ADMIN,
        //UserRole.PURCHASING_AGENT,
      ].includes(payload.user.role as any)
    ) {
      {
        throw new AppError(
          HttpStatusCode.Unauthorized,
          "You are not authorized to perform this action!",
        );
      }
    }

    type TWS = { pa_wh: { wareHouseStuffId: string } };
    // step 02. Get the order first and verify it first
    const getOrder = (await this.productRepository.getOrderById({
      orderId: payload.orderId,
      productStatus: ProductStatus.PURCHASED,
      select: {
        pa_wh: {
          select: {
            wareHouseStuffId: true,
          },
        },
      },
    })) as TWS | Order;

    if (!getOrder) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Order not found or not purchased yet!",
      );
    }

    // assertitioning the type to the order
    const { pa_wh } = getOrder as TWS;
    if (pa_wh.wareHouseStuffId === payload.warehouseStuffId) {
      throw new AppError(
        HttpStatusCode.BadRequest,
        "This warehouse stuff already assigned!",
      );
    }

    // step 03. Get the ws and verify it first
    const getWS = await userRepository.getUserByIdFromDB(
      payload.warehouseStuffId,
      {
        role: true,
        profile: {
          select: {
            firstName: true,
          },
        },
      },
    );

    if (!getWS) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Warehouse stuff doesn't exist!",
      );
    }

    if (getWS.role !== UserRole.WAREHOUSE_STAFF) {
      throw new AppError(
        HttpStatusCode.Unauthorized,
        `User: ${getWS.profile?.firstName + `. Id: ${payload.warehouseStuffId}` || ""} is not a warehouse staff! `,
      );
    }

    // step 04. Assign the ws
    return await this.assignPARepository.assignWS({
      orderId: payload.orderId,
      warehouseStuffId: payload.warehouseStuffId,
    });
  }
}

export default AssignP_A_Service;
