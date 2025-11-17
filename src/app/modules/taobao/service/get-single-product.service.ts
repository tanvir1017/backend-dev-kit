import { HttpStatusCode } from "axios";
import apiClient from "../../../../lib/api-client";
import { TAOBAO_API } from "../../../config/taobaoConfig";
import AppError from "../../../errors/appError";
// Define the clean, front-end friendly interface
interface I_NormalizedItem {
  id: string;
  title: string;
  short_desc: string;
  price: number;
  original_price: number;
  main_image: string;
  images: string[];
  video: string | null;
  description: string;
  brand: {
    name: string;
    id: number | string;
  };
  seller_info: {
    name: string;
    shop_id: string;
    shop_name: string; // NEW
    rating: number;
    delivery_score: number; // NEW
  };
  metrics: {
    stock: number;
    total_sold: number;
  };
  badges: {
    is_tmall: boolean;
    is_official_store: boolean;
  };
  category_id: number; // NEW
  skus: any[];
  props: { [key: string]: string };
  shipping_info: {
    location: string;
    post_fee: number;
    express_fee: number;
  };
}

export const getSingleItemFromTaobao = async ({
  lang = "en",
  num_iid,
}: {
  num_iid: string;
  lang?: string;
}): Promise<I_NormalizedItem> => {
  try {
    const params = {
      num_iid,
      lang,
    };

    const response = await apiClient.get(
      `/taobao/${TAOBAO_API.ITEM.ITEM_GET}`,
      {
        params,
      },
    );
    const item = response.data.item;

    if (item.num_iid === undefined || item.format_check === "fail") {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Item not found from taobao!",
      );
    }

    // Check if it's an official store based on the seller's nickname
    const isOfficialStore = item.nick ? item.nick.includes("官方") : false;

    const normalizedData: I_NormalizedItem = {
      id: item.num_iid?.toString() || "",
      title: item.title || "No Title",
      short_desc: item.desc_short || "",
      price: parseFloat(item.price) || 0,
      original_price: item.orginal_price
        ? parseFloat(item.orginal_price)
        : parseFloat(item.price) || 0,
      main_image: item.pic_url?.includes("http")
        ? item.pic_url
        : `https:${item.pic_url}`,
      images: normalizeImages(item),
      video: item.video?.url || null, // Use the actual video URL if it exists
      description: item.desc || "",
      brand: {
        name: item.brand || "Unknown Brand",
        id: item.brandId || 0,
      },
      seller_info: {
        name: item.nick || "Unknown Seller",
        shop_id: item.shop_id?.toString() || "",
        shop_name: item.seller_info?.shop_name || "", // NEW
        rating: item.seller_info?.item_score || 0,
        delivery_score: item.seller_info?.delivery_score || 0, // NEW
      },
      // NEW METRICS SECTION
      metrics: {
        stock: parseInt(item.num) || 0,
        total_sold: parseInt(item.total_sold) || 0, // This will be -1 for the dog food
      },
      // NEW BADGES SECTION
      badges: {
        is_tmall: item.tmall || false,
        is_official_store: isOfficialStore,
      },
      category_id: item.cid || 0, // NEW
      skus: normalizeSkus(item),
      props: normalizeProps(item.props), // Pass the props array directly
      shipping_info: {
        location: item.location || "",
        post_fee: parseFloat(item.post_fee) || 0,
        express_fee: parseFloat(item.express_fee) || 0,
      },
    };

    return normalizedData;
  } catch (error) {
    throw new AppError(
      HttpStatusCode.InternalServerError,
      `${(error as Error).message || "Failed to retrieve item from Taobao API"}`,
    );
  }
};

// Helper function to extract and format image URLs
const normalizeImages = (item: any): string[] => {
  const images: string[] = [];

  // Helper function to ensure URL has proper protocol
  const ensureAbsoluteUrl = (url: string): string => {
    if (!url) return "";

    // If URL already starts with http:// or https://, return as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // If URL starts with // (protocol-relative), add https:
    if (url.startsWith("//")) {
      return `https:${url}`;
    }

    // Otherwise, assume it's a relative path and add https://
    // (Though Taobao URLs usually start with //)
    return `https://${url}`;
  };

  // Use the main image
  if (item.pic_url) {
    const mainImageUrl = ensureAbsoluteUrl(item.pic_url);
    if (mainImageUrl) images.push(mainImageUrl);
  }

  // Use additional images from item_imgs
  if (item.item_imgs && Array.isArray(item.item_imgs)) {
    item.item_imgs.forEach((img: any) => {
      if (img.url) {
        const imageUrl = ensureAbsoluteUrl(img.url);
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      }
    });
  }

  // Use color-specific images from prop_imgs
  if (item.prop_imgs?.prop_img) {
    item.prop_imgs.prop_img.forEach((propImg: any) => {
      if (propImg.url) {
        const imageUrl = ensureAbsoluteUrl(propImg.url);
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      }
    });
  }

  return images;
};

// Helper to simplify the complex SKU structure
const normalizeSkus = (item: any): any[] => {
  if (!item.skus?.sku || !Array.isArray(item.skus.sku)) {
    return [];
  }
  return item.skus.sku.map((sku: any) => ({
    sku_id: sku.sku_id,
    price: sku.price,
    original_price: sku.orginal_price,
    // This is a simple version. You could parse properties_name into a nicer object.
    properties_name: sku.properties_name,
    quantity: sku.quantity,
  }));
};

// Helper to transform the props array into a key-value object

const normalizeProps = (
  propsArray: any[] | undefined,
): { [key: string]: string } => {
  const propsMap: { [key: string]: string } = {};
  if (propsArray && Array.isArray(propsArray)) {
    propsArray.forEach((prop: { name: string; value: string }) => {
      if (prop.name && prop.value) {
        propsMap[prop.name] = prop.value;
      }
    });
  }
  return propsMap;
};
