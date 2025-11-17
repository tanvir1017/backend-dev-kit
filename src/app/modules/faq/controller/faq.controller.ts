import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import AppError from "../../../errors/appError";
import { faqService } from "../service/faq.service";

// ** get all faq
const getAllFAQ = asyncHandler(async (req, res) => {
  const data = await faqService.getAllFAQ();

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all faq success",
    data,
  });
});

// ** get single faq
const getSingleFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await faqService.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single faq success",
    data: faq,
  });
});

// ** create new faq
const createFAQ = asyncHandler(async (req, res) => {
  const faq = await faqService.createFAQ(req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Creating faq success",
    data: faq,
  });
});

// ** update faq
const updateFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await faqService.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  const updatedFaq = await faqService.updateFAQ(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Updating faq success",
    data: updatedFaq,
  });
});

// ** delete faq
const deleteFAQ = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const faq = await faqService.getSingleFAQ(id);

  if (!faq) {
    throw new AppError(HttpStatusCode.NotFound, "FAQ not found");
  }

  const deletedFaq = await faqService.deleteFAQ(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Deleting faq success",
    data: null,
  });
});

export const faqController = {
  getAllFAQ,
  getSingleFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
