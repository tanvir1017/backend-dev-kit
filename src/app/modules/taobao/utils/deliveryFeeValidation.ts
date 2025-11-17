import { I_ItemFeeResponse } from "../types/taobao.types";

export function getSafeDeliveryFee(item: I_ItemFeeResponse) {
  const expressFee = item.express_fee || "";
  const postFee = item.post_fee || "0";

  // Case 1: Free shipping (免运费)
  if (expressFee.includes("免运费")) {
    return 0;
  }

  // Case 2: Extract number from express_fee (e.g., "快递: ￥15.00")
  const numberMatch = expressFee.match(/(\d+\.?\d*)/);
  if (numberMatch) {
    return parseFloat(numberMatch[1]);
  }

  // Case 3: Use post_fee as fallback
  return parseFloat(postFee) || 0;
}

// console.log(getSafeDeliveryFee(item1)); // 0
// console.log(getSafeDeliveryFee(item2)); // 15
