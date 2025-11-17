import { HttpStatusCode } from "axios";
import apiClient from "../../../../lib/api-client";
import { bucketStorageService } from "../../../../lib/utils/upload-digital-ocean";
import { TAOBAO_API } from "../../../config/taobaoConfig";
import AppError from "../../../errors/appError";
import {
  I_ItemFee,
  I_ItemSearchByImagQuery,
  I_TaobaoMeta,
  I_TaobaoSearchParams,
  I_TaobaoSimilarParams,
} from "../types/taobao.types";

export const taobaoServices = {
  // get product by search query
  searchProductFromTaobao: async (params: I_TaobaoSearchParams) => {
    try {
      // Validate and sanitize parameters
      const sanitizedParams = {
        q: params.q?.trim() || undefined,
        start_price:
          params.start_price !== undefined
            ? Number(params.start_price)
            : undefined,
        end_price:
          params.end_price !== undefined ? Number(params.end_price) : undefined,
        page: params.page !== undefined ? Number(params.page) : 1,
        cat: params.cat !== undefined ? Number(params.cat) : undefined,
        discount_only:
          params.discount_only !== undefined
            ? Boolean(params.discount_only)
            : undefined,
        sort: params.sort?.trim() || undefined,
        page_size:
          params.page_size !== undefined ? Number(params.page_size) : 10,
        seller_info:
          params.seller_info !== undefined
            ? Boolean(params.seller_info)
            : undefined,

        cache: params.cache !== undefined ? Boolean(params.cache) : undefined,
        nick: params.nick?.trim() || undefined,
        ppath: params.ppath?.trim() || undefined,
        imgid: params.imgid?.trim() || undefined,
        filter: params.filter?.trim() || undefined,
        lang: params.lang?.trim() || undefined, // Add lang parameter
      };

      // Validate pagination parameters
      if (
        isNaN(sanitizedParams?.page_size!) ||
        sanitizedParams?.page_size! < 1 ||
        sanitizedParams?.page_size! > 100
      ) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid page_size parameter must be a number between 1 and 100",
        );
      }

      if (
        isNaN(sanitizedParams?.page) ||
        sanitizedParams?.page < 1 ||
        sanitizedParams?.page > 100
      ) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid page parameter must be a number between 1 and 100",
        );
      }

      // Remove undefined values to avoid sending them in the API request
      const cleanParams = Object.fromEntries(
        Object.entries(sanitizedParams).filter(
          ([__key, value]) => value !== undefined,
        ),
      );

      const response = await apiClient.get(
        `/taobao/${TAOBAO_API.ITEM.ITEM_SEARCH}`,
        {
          params: cleanParams,
        },
      );

      // Validate response structure
      if (!response.data) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid response from Taobao API",
        );
      }

      // Transform the response to desired format
      return {
        meta: {
          page: Number(response.data.items?.page) || 1,
          page_size: response.data.items?.page_size || 0,
          total_results: Number(response.data.items?.total_results) || 0,
          real_total_results:
            Number(response.data.items?.real_total_results) || 0,
          pagecount: Number(response.data.items?.pagecount) || 0,
        } satisfies I_TaobaoMeta,
        items: response.data.items?.item || [],
      };
    } catch (error: any) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        (error as Error).message || "Failed to fetch products from Taobao API",
      );
    }
  },

  // search product by image id
  searchProductByImageIdFromTaobao: async (
    file: Express.Multer.File,
    query: { lang?: string },
  ) => {
    // Step. 1 First upload the file to the Digital ocean
    const { Location } =
      await bucketStorageService.uploadToDigitalOceanAWS(file);

    // Step. 2 Setup the image link to params imgId
    let params: I_ItemSearchByImagQuery | null = null;
    if (Location) {
      params = {
        imgid: Location,
        img_type: "",
        lang: query?.lang || "en",
      };
    }

    try {
      // Step. 3 Call the API with the imgId
      const response = await apiClient.get(
        `/taobao/${TAOBAO_API.ITEM.ITEM_SEARCH_IMG}`,
        {
          params,
        },
      );

      // Transform the response to desired format
      return {
        meta: {
          page: Number(response.data.items?.page) || 1,
          page_size: response.data.items?.page_size || 0,
          total_results: Number(response.data.items?.total_results) || 0,
          real_total_results:
            Number(response.data.items?.real_total_results) || 0,
          pagecount: Number(response.data.items?.pagecount) || 0,
        } satisfies I_TaobaoMeta,
        items: response.data.items?.item || [],
      };
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        (error as Error).message || "Failed to fetch products from Taobao API",
      );
    }
  },

  // Suggest similar products by image id
  // Add this to your taobaoServices
  searchSimilarItemsFromTaobao: async (params: I_TaobaoSimilarParams) => {
    try {
      // Validate and sanitize parameters
      const sanitizedParams = {
        num_iid: params.num_iid?.trim(),
        page: params.page !== undefined ? Number(params.page) : 1,
        page_size:
          params.page_size !== undefined ? Number(params.page_size) : 12, // Good default for suggestions
        sort: params.sort?.trim() || undefined,
      };

      // Validate the essential parameter
      if (!sanitizedParams.num_iid) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Product ID (num_iid) is required to find similar items",
        );
      }

      // Validate pagination parameters
      if (sanitizedParams.page_size < 1 || sanitizedParams.page_size > 50) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid page_size parameter must be a number between 1 and 50",
        );
      }
      if (sanitizedParams.page < 1 || sanitizedParams.page > 100) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid page parameter must be a number between 1 and 100",
        );
      }

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(sanitizedParams).filter(
          ([_, value]) => value !== undefined,
        ),
      );

      // Use the item_search_similar API
      const response = await apiClient.get(
        `/taobao/${TAOBAO_API.ITEM.ITEM_SEARCH_SIMILAR}`, // Use the similar endpoint
        {
          params: cleanParams,
        },
      );

      // Validate response structure
      if (!response.data) {
        throw new AppError(
          HttpStatusCode.BadRequest,
          "Invalid response from Taobao API",
        );
      }

      // Transform the response to match your desired format
      return {
        meta: {
          page: Number(response.data.items?.page) || sanitizedParams.page,
          page_size:
            response.data.items?.page_size || sanitizedParams.page_size,
          total_results: Number(response.data.items?.total_results) || 0,
          real_total_results:
            Number(response.data.items?.real_total_results) || 0,
          pagecount: Number(response.data.items?.pagecount) || 0,
        } satisfies I_TaobaoMeta,
        items: response.data.items?.item || [],
      };
    } catch (error: any) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        (error as Error).message ||
          "Failed to fetch similar products from Taobao API",
      );
    }
  },

  // Service function to get area codes
  getTaobaoAreas: async (parentId: string | null = null): Promise<any> => {
    try {
      const response = await apiClient.get(`/taobao/areas_get/`, {
        params: {
          fields: "id,type,name,parent_id,zip",
          parent_id: parentId, // Optional: get areas under specific parent
        },
      });

      return response.data;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        `${(error as Error).message || " Failed to retrieve area codes from Taobao API"}`,
      );
    }
  },

  // Item fee
  itemFeeFromTaobao: async ({
    area_id,
    num_iid,
    lang = "en",
    sku,
  }: I_ItemFee) => {
    try {
      const response = await apiClient.get(
        `/taobao/${TAOBAO_API.ITEM.ITEM_FEE}`,
        {
          params: {
            num_iid,
            area_id,
            lang,
            sku,
          },
        },
      );

      const result = response.data;
      const responseData = {
        num_iid: result.item.num_iid,
        area_id: result.item.area_id,
        location: result.item.location,
        shipping_to: result.item.shipping_to,
        express_fee: result.item.express_fee,
        ems_fee: result.item.ems_fee,
        post_fee: result.item.post_fee,
      };

      return responseData;
    } catch (error) {
      throw new AppError(
        HttpStatusCode.InternalServerError,
        (error as Error).message || "Failed to fetch item fee from Taobao API",
      );
    }
  },
};
