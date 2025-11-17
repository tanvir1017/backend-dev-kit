import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { contactUsService } from "../service/contact-us.service";
import { I_ContactUsQuery } from "../types/contact-us.types";

// ** retrieve all contact us from db
const getAllContactUs = asyncHandler(async (req, res) => {
  const query = req.query as typeof req.query & I_ContactUsQuery;
  console.log("🚀 ~ query:", query);
  const result = await contactUsService.getContactUsFromDb(query);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "All contact retrieved successfully",
    success: true,
    data: result,
  });
});

// ** create new contact us
const createNewContactUs = asyncHandler(async (req, res) => {
  const result = await contactUsService.creteContactUs(req.body);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "Creating new contact us successful",
    success: true,
    data: result,
  });
});

// ** search all contact us from db
const searchContactUs = asyncHandler(async (req, res) => {
  const { searchQuery } = req.query;
  const result = await contactUsService.searchContactUsFromDb(
    searchQuery as string,
    req.query,
  );

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "All contact retrieved successfully",
    success: true,
    data: result,
  });
});

// ** get contact us by id
const getContactUsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await contactUsService.getContactUsById(id);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "Gating contact us by id successful",
    success: true,
    data: result,
  });
});

// ** get contact us by id
const updateContactUsStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const result = await contactUsService.updateContactUsStatus(id, status);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "Update contact us success",
    success: true,
    data: result,
  });
});

// ** delete contact us by id
const deleteContactUs = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await contactUsService.deleteContactUs(id);

  sendResponse(res, {
    statusCode: HttpStatusCode.Ok,
    message: "Delete contact us success",
    success: true,
    data: result,
  });
});

export const contactUsController = {
  getAllContactUs,
  searchContactUs,
  createNewContactUs,
  getContactUsById,
  updateContactUsStatus,
  deleteContactUs,
};
