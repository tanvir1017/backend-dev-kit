import { NormalOrHiddenStatus } from "@prisma/client";
import { z } from "zod";

const createNewEvaluationManagementSchema = z.object({
  body: z.object({
    memberId: z.string(),
    score: z.number().int().min(1).max(5),
    evaluation: z.string(),
    evaluationDate: z.string(),
    status: z.enum([
      ...(Object.values(NormalOrHiddenStatus) as [string, ...string[]]),
    ]),
  }),
});

const updateEvaluationManagementSchema = z.object({
  body: z.object({
    memberId: z.string().optional(),
    score: z.number().int().min(1).max(5).optional(),
    evaluation: z.string().optional(),
    evaluationData: z.coerce.date().optional(),
    status: z
      .enum([...(Object.values(NormalOrHiddenStatus) as [string, ...string[]])])
      .optional(),
  }),
});

export const evaluationManagementValidation = {
  createNewEvaluationManagementSchema,
  updateEvaluationManagementSchema,
};
