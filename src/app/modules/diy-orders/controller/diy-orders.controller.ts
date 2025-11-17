import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import { diyOrderService } from "../service/diy-orders.service";

class DiyOrderController {
  constructor() {}

  // Create new DIY order
  createNewDiyOrder = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as I_GlobalJwtPayload;
    const body = req.body;
    const file = req.file as Express.Multer.File;

    const result = await diyOrderService.createNewDiyOrder({
      user,
      payload: body,
      file: file,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Created,
      success: true,
      message: "DIY Order created successfully",
      data: result,
    });
  });

  //   // Get all DIY orders for logged in user
  getAllDiyOrders = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as I_GlobalJwtPayload;
    const query = req.query;

    const result = await diyOrderService.getUserDiyOrders({ user, query });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      success: true,
      message: "DIY Orders retrieved successfully",
      data: result,
    });
  });

  //   // Get single DIY order
  //   getSingleDiyOrder = async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const userId = req.user?.id;

  //       const result = await diyOrderService.getSingleDiyOrder(id, userId!);

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "DIY Order retrieved successfully",
  //         data: result,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.NOT_FOUND).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };

  //   // Update DIY order
  //   updateDiyOrder = async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const userId = req.user?.id;

  //       const result = await diyOrderService.updateDiyOrder(
  //         id,
  //         userId!,
  //         req.body,
  //       );

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "DIY Order updated successfully",
  //         data: result,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };

  //   // Delete DIY order
  //   deleteDiyOrder = async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const userId = req.user?.id;

  //       await diyOrderService.deleteDiyOrder(id, userId!);

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "DIY Order deleted successfully",
  //         data: null,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.NOT_FOUND).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };

  //   // Add to cart
  //   addToCart = async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const userId = req.user?.id;

  //       const result = await diyOrderService.addToCart(id, userId!);

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "DIY Order added to cart successfully",
  //         data: result,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };

  //   // Buy now
  //   buyNow = async (req: Request, res: Response) => {
  //     try {
  //       const { id } = req.params;
  //       const userId = req.user?.id;

  //       const result = await diyOrderService.buyNow(id, userId!);

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "DIY Order processed successfully",
  //         data: result,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };

  //   // Calculate total
  //   calculateTotal = async (req: Request, res: Response) => {
  //     try {
  //       const { productPrice, deliveryFee } = req.body;

  //       const result = await diyOrderService.calculateTotalAmount(
  //         productPrice,
  //         deliveryFee,
  //       );

  //       res.status(httpStatus.OK).json({
  //         success: true,
  //         message: "Total calculated successfully",
  //         data: result,
  //       });
  //     } catch (error: any) {
  //       res.status(httpStatus.BAD_REQUEST).json({
  //         success: false,
  //         message: error.message,
  //         data: null,
  //       });
  //     }
  //   };
}

export const diyOrderController = new DiyOrderController();
