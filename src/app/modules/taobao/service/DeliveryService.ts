import apiClient from "../../../../lib/api-client";
import { TAOBAO_API } from "../../../config/taobaoConfig";

// Service to handle delivery calculations
export class DeliveryService {
  private static areaMap: Record<string, string> = {
    深圳: "440306",
    shenzhen: "440306",
  };

  static async calculateFee({
    productId,
    destination = "440306",
  }: {
    productId: string;
    destination?: string;
  }) {
    try {
      const feeData = await apiClient.get(
        `/taobao/${TAOBAO_API.ITEM.ITEM_FEE}`,
        {
          params: {
            num_iid: productId,
            area_id: destination,
            // sku_id: "0", // Default SKU
          },
        },
      );

      const result = feeData.data;
      return {
        num_iid: result.item.num_iid,
        area_id: result.item.area_id,
        location: result.item.location,
        shipping_to: result.item.shipping_to,
        express_fee: result.item.express_fee,
        ems_fee: result.item.ems_fee,
        post_fee: result.item.post_fee,
      };
    } catch (error) {
      console.error(
        (error as Error).message ||
          "Unknown error occurred from Delivery Service Taobao API",
      );
      return {
        num_iid: productId,
        area_id: destination,
        location: "shenzhen | 深圳",
        shipping_to: "shenzhen | 深圳",
        express_fee: 25,
        ems_fee: 0,
        post_fee: 0,
      };
    }
  }
}
