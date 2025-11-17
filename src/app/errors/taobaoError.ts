import { taobaoErrorMap } from "../modules/taobao/utils/taobaoErrorMap";
import AppError from "./appError";

class TaobaoError extends AppError {
  public taobao: any;

  constructor(taobaoData: any) {
    const mapping = taobaoErrorMap[taobaoData.error_code] || {
      statusCode: 400,
      extraInfo: "Unknown Taobao error occurred.",
    };

    super(mapping.statusCode, taobaoData.error || "Something went wrong!");

    this.taobao = {
      error: taobaoData.error || "",
      errorCode: taobaoData.error_code || "",
      reason: taobaoData.reason || "",
      extraInfo: mapping.extraInfo,
    };
  }
}
export default TaobaoError;
