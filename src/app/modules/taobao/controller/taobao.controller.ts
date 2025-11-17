import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import AppError from "../../../errors/appError";

import { getSingleItemFromTaobao } from "../service/get-single-product.service";
import { taobaoServices } from "../service/taobao.service";
import { I_ItemFee, I_TaobaoSimilarParams } from "../types/taobao.types";

export const taobaoController = {
  // get single item by its id
  itemGet: asyncHandler(async (req, res) => {
    const query = req.query as typeof req.query & {
      num_iid: string;
      lang?: string;
    };
    const taobaoData = await getSingleItemFromTaobao(query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Single product fetched successfully",
      data: taobaoData,
    });
  }),

  // Get similar items for a product
  itemGetSimilar: asyncHandler(async (req, res) => {
    // The request should query parameters like ?num_iid=545557499253&page_size=8
    const similarItemsData = await taobaoServices.searchSimilarItemsFromTaobao(
      req.query as unknown as I_TaobaoSimilarParams,
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Similar products fetched successfully",
      data: similarItemsData, // This will have the same { meta, items } structure
    });
  }),

  searchProducts: asyncHandler(async (req, res) => {
    try {
      // Call service to fetch products
      const products = await taobaoServices.searchProductFromTaobao(req.query);

      // Send successful response
      sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Products fetched successfully",
        data: products,
      });
    } catch (error) {
      // Handle errors
      throw new AppError(
        HttpStatusCode.InternalServerError,
        (error as Error).message || "Internal server error",
      );
    }
  }),

  /**
   * search product by image id
   * @example
   * Visit: [Demo](https://api-gw.onebound.cn/taobao/item_search_img/?key=t3480151373&imgid=http://g-search3.alicdn.com/img/bao/uploaded/i4/O1CN01IDpcD81zHbpHs1YgT_!!2200811456689.jpg&img_type=&&lang=en&secret=13735c58)
   */
  searchProductByImageId: asyncHandler(async (req, res) => {
    const file = req.file as Express.Multer.File;
    const query = req.query as typeof req.query & {
      lang?: string;
    };

    const taobaoData = await taobaoServices.searchProductByImageIdFromTaobao(
      file,
      query,
    );
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Product search by image successful!",
      data: taobaoData,
    });
  }),

  /**
   * Get area's
   *
   */
  // getAreas: asyncHandler(async (req, res) => {
  //   const num_iid = req.query.num_iid as string;
  //   const area_id = req.query.area_id as string;
  //   const fee = await DeliveryService.calculateFee(num_iid, area_id);

  //   sendResponse(res, {
  //     success: true,
  //     statusCode: 200,
  //     message: "Delivery fee fetched successfully",
  //     data: fee,
  //   });
  // }),

  /**
   * Get the item_fee of a product
   *
   */

  itemFee: asyncHandler(async (req, res) => {
    const query = req.query as typeof req.query & I_ItemFee;
    const fee = await taobaoServices.itemFeeFromTaobao(query);
    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Item fee fetched successfully",
      data: fee,
    });
  }),
};
