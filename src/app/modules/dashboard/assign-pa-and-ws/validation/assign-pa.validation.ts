import { z } from "zod";

// Assign Purchasing Agent validation schema
const assignPurchasingAgentValidationSchema = z.object({
  body: z.object({
    purchasingAgentId: z
      .string()
      .min(24)
      .max(24)
      .describe("Purchasing Agent id must be provided!"),
    orderId: z.string().min(24).max(24).describe("Order id must be provided!"),
    remarks: z.string().optional(),
  }),
});

// Assign Warehouse Staff validation schema
const assignWarehouseStuffValidationSchema = z.object({
  body: z.object({
    warehouseStuffId: z
      .string()
      .min(24)
      .max(24)
      .describe("Warehouse Stuff id must be provided!"),
    orderId: z.string().min(24).max(24).describe("Order id must be provided!"),
  }),
});

export const AssignPAOrWSValidation = {
  assignPA: assignPurchasingAgentValidationSchema,
  assignWS: assignWarehouseStuffValidationSchema,
};
//////////////////////////// <- End -> ////////////////////////////////////////////
