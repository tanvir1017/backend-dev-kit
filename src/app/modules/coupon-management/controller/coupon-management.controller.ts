import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { couponService } from "../service/coupon-management.service";

// ** get all Coupon
const getAllCoupon = asyncHandler(async (req, res) => {
  const results = await couponService.getAllCoupon(req.query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all Coupon success",
    data: results,
  });
});

// ** get coupon by id
const getSingleCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.getSingleCoupon(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single Coupon success",
    data: coupon,
  });
});

// ** create new coupon
const createNewCoupon = asyncHandler(async (req, res) => {
  const coupon = await couponService.createNewCoupon(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Creating new Coupon success",
    data: coupon,
  });
});

// ** update coupon
const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.updateCoupon(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating Coupon success",
    data: coupon,
  });
});

// ** get coupon by id
const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await couponService.deleteCoupon(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Deleting Coupon success",
    data: null,
  });
});

export const couponController = {
  getAllCoupon,
  getSingleCoupon,
  createNewCoupon,
  updateCoupon,
  deleteCoupon,
};
