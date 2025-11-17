import { T_Sku } from "../../orders/types/orders.types";

export interface I_TaobaoSearchParams {
  q?: string;
  start_price?: number;
  end_price?: number;
  page?: number;
  cat?: number;
  discount_only?: boolean;
  sort?: string;
  page_size?: number;
  seller_info?: boolean;
  nick?: string;
  ppath?: string;
  imgid?: string;
  filter?: string;
  lang?: string;
  cache?: "yes" | "no";
}

// Will and only used for those data coming from taobao

export interface I_TaobaoMeta {
  page: number;
  page_size: number;
  total_results: number;
  real_total_results: number;
  pagecount: number;
}

// Will and only used for those data coming from taobao
export interface I_ItemSearchByImagQuery {
  imgid: string; // img uploaded url
  img_type?: string;
  lang?: string;
}

export interface I_TaobaoSimilarParams {
  num_iid: string; // The ID of the product to find similar items for (REQUIRED)
  page?: number; // Page number for pagination
  page_size?: number; // Number of results per page
  sort?: string;
  // The samestyle API might also accept a 'sample_id', but 'num_iid' is the standard key
}

////////////////////////////////////////////////////////
// // Delivery Fees -> Item fee
////////////////////////////////////////////////////////
export interface I_ItemFee {
  num_iid: number;
  area_id: number;
  lang?: string;
  sku?: T_Sku["body"];
}

export interface I_ItemFeeResponse {
  num_iid: string;
  area_id: string;
  location: string;
  shipping_to: string;
  express_fee: string;
  ems_fee: string;
  post_fee: string;
}
