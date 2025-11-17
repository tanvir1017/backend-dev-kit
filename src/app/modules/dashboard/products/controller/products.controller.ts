import { ProductStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../../lib/utils/async-handler";
import sendResponse from "../../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../../interface/common.interface";
import ProductService from "../service/products.service";
import {
  I_GetAllOrdersQuery,
  T_DeleteQcPhotos,
  T_QcDetails,
} from "../types/products.types";

class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  // ** Get all products/orders
  allProduct = asyncHandler(async (req, res) => {
    const query = req.query as I_GetAllOrdersQuery;
    const user = req.user as I_GlobalJwtPayload;

    const result = await this.productService.getAllOrders(query, user);

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Products retrieved successfully!",
      success: true,
      data: result,
    });
  });

  // ** Get all purchased products/orders
  allPurchasedProduct = asyncHandler(async (req, res) => {
    const query = req.query as I_GetAllOrdersQuery;
    const user = req.user as I_GlobalJwtPayload;

    const result = await this.productService.getAllOrders(query, user);

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Products retrieved successfully!",
      success: true,
      data: result,
    });
  });

  // You can add more methods following the same pattern:

  //   // ** Get single product by ID
  //   singleProduct = asyncHandler(async (req: Request, res: Response) => {
  //     const { id } = req.params;

  //     // Assuming you have a getOrderById method in ProductService
  //     // const result = await this.productService.getOrderById(id);

  //     sendResponse(res, {
  //       statusCode: StatusCodes.OK,
  //       message: "Product retrieved successfully!",
  //       success: true,
  //       data: null, // replace with actual data
  //     });
  //   });

  //   // ** Create new product
  //   createProduct = asyncHandler(async (req: Request, res: Response) => {
  //     const body = req.body;

  //     // Assuming you have a createOrder method in ProductService
  //     // const result = await this.productService.createOrder(body);

  //     sendResponse(res, {
  //       statusCode: StatusCodes.CREATED,
  //       message: "Product created successfully!",
  //       success: true,
  //       data: null, // replace with actual data
  //     });
  //   });

  //   // ** Update product
  //   updateProduct = asyncHandler(async (req: Request, res: Response) => {
  //     const { id } = req.params;
  //     const body = req.body;

  //     // Assuming you have an updateOrder method in ProductService
  //     // const result = await this.productService.updateOrder(id, body);

  //     sendResponse(res, {
  //       statusCode: StatusCodes.OK,
  //       message: "Product updated successfully!",
  //       success: true,
  //       data: null, // replace with actual data
  //     });
  //   });
  //
  // ** Change product status
  changeProductStatus = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const body = req.body as {
      productId: string;
      status: ProductStatus;
    };
    const result = await this.productService.changeProductStatus({
      user,
      payload: body,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: `Product status updated to ${body.status.toLowerCase()} successful!`,
      success: true,
      data: result, // replace with actual data
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////
  // _> Qc Details ~ Modules
  //////////////////////////////////////////////////////////////////////////////////////////
  // ** Update Qc photos
  addQc = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;

    const files = req.files as {
      images: Express.Multer.File[];
    };

    const body = req.body as T_QcDetails["body"] & {
      notifyUser: boolean;
    };

    const result = await this.productService.addQcDetails({
      user,
      payload: body,
      files,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Created,
      message: "Qc details updated successfully!",
      success: true,
      data: result, // replace with actual data
    });
  });

  // Update the qc details
  updateQc = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const files = req.files as { images: Express.Multer.File[] };
    const body = req.body as Partial<T_QcDetails["body"]> & {
      notifyUser: boolean;
    };
    const { qcId } = req.params as {
      qcId: string;
    };

    const result = await this.productService.updateQcDetails({
      qcId,
      user,
      payload: body,
      files,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Qc details updated successfully!",
      success: true,
      data: result, // replace with actual data
    });
  });

  // Update the qc details
  deleteQcPhotos = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const body = req.body as T_DeleteQcPhotos;

    const result = await this.productService.deleteQcPhotos({
      user,
      payload: body,
    });
    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Qc photos deleted successfully!",
      success: true,
      data: result, // replace with actual data
    });
  });

  //   // ** Delete product
  deleteQcDetails = asyncHandler(async (req, res) => {
    const { qcId } = req.params;

    // Assuming you have a deleteOrder method in ProductService
    const result = await this.productService.deleteQcDetails({ qcId });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Qc details deleted successfully!",
      success: true,
      data: null,
    });
  });
}

export default ProductController;
