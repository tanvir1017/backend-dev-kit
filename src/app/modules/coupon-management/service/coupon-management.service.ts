import { CouponManagement } from "@prisma/client";
import { HttpStatusCode } from "axios";

import AppError from "../../../errors/appError";
import { I_PaginationResponse } from "../../../interface/common.interface";
import { couponRepository } from "../repository/coupon-management.repository";

// ** get all Coupon
const getAllCoupon = async (query?: Record<string, any>) => {
  const page = Number(query?.page) || 1;
  const limit = Number(query?.limit) || 10;
  const skip = Number(page - 1) * limit || 0;

  // get total count of contact us
  const totalCount = await couponRepository.getCouponCount();

  // calculate total page for pagination
  const totalPages = Math.ceil(totalCount / limit);

  const result = await couponRepository.getAllCoupon(limit, skip, query!);

  const paginationSchema: I_PaginationResponse<CouponManagement[]> = {
    meta: {
      totalCount,
      totalPages,
      page,
      limit,
    },
    result,
  };

  return paginationSchema;
};

// ** get Coupon by id
const getSingleCoupon = async (id: string) => {
  const Coupon = await couponRepository.getSingleCoupon(id);

  if (!Coupon) {
    throw new AppError(HttpStatusCode.NotFound, "Coupon not found");
  }

  return Coupon;
};

// ** create new Coupon
const createNewCoupon = async (payload: CouponManagement) => {
  return await couponRepository.createNewCoupon(payload);
};

// ** update Coupon
const updateCoupon = async (id: string, payload: Partial<CouponManagement>) => {
  const coupon = await couponRepository.getSingleCoupon(id);

  if (!coupon) {
    throw new AppError(HttpStatusCode.NotFound, "Coupon not found");
  }

  return await couponRepository.updateCoupon(id, payload);
};

// ** delete Coupon
const deleteCoupon = async (id: string) => {
  const Coupon = await couponRepository.getSingleCoupon(id);

  if (!Coupon) {
    throw new AppError(HttpStatusCode.NotFound, "Coupon not found");
  }

  return await couponRepository.deleteCoupon(id);
};

export const couponService = {
  getAllCoupon,
  getSingleCoupon,
  createNewCoupon,
  updateCoupon,
  deleteCoupon,
};
