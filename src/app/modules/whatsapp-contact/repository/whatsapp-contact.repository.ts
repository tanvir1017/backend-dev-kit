import prisma from "../../../../lib/utils/prisma.utils";
import { T_WhatsappContactUpdate } from "../types/whatsapp-contact.types";

// ** get whatsapp contact
const getWhatsappContact = async () => {
  return await prisma.whatsappContact.findFirst({});
};

// ** update whatsapp contact
const updateWhatsappContact = async (
  id: string,
  payload: T_WhatsappContactUpdate,
) => {
  return await prisma.whatsappContact.update({
    where: { id },
    data: payload,
  });
};

const createWhatsappContact = async (payload: T_WhatsappContactUpdate) => {
  return await prisma.whatsappContact.create({
    data: {
      ...payload,
    },
  });
};

export const whatsappContactRepository = {
  updateWhatsappContact,
  getWhatsappContact,
  createWhatsappContact,
};
