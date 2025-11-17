import { Response } from "express";

interface I_ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  error?: string;
  errorCode?: string;
  reason?: string;
  extraInfo?: string;
  data?: T;
}
const sendResponse = <T>(res: Response, payload: I_ApiResponse<T>) => {
  res.status(payload.statusCode).json({
    success: payload.success,
    statusCode: payload.statusCode,
    message: payload.message,
    error: payload.error || "",
    errorCode: payload.errorCode || "",
    reason: payload.reason || "",
    extraInfo: payload.extraInfo || "",
    data: payload.data ?? null,
  });
};

export default sendResponse;
