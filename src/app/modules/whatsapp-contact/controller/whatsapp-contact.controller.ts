import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { whatsappContactService } from "../service/whatsapp-contact.service";

// ** get whatsapp contact
const getWhatsappContact = asyncHandler(async (req, res) => {
  const data = await whatsappContactService.getWhatsappContact();

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Retrieving whatsapp contact success",
    data,
  });
});

// ** get whatsapp contact
const updateWhatsappContact = asyncHandler(async (req, res) => {
  const file = req.file;

  const data = await whatsappContactService.updateWhatsappContact(
    req.body,
    file,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Update success",
    data,
  });
});

export const whatsappContactController = {
  getWhatsappContact,
  updateWhatsappContact,
};
