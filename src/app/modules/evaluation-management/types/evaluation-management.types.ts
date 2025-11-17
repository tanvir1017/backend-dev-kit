import { z } from "zod";
import { evaluationManagementValidation } from "../validation/evaluation-management.validation";

export type T_NewEvaluationManagement = z.infer<
  typeof evaluationManagementValidation.createNewEvaluationManagementSchema
>["body"];

export type T_UpdateEvaluationManagement = z.infer<
  typeof evaluationManagementValidation.updateEvaluationManagementSchema
>["body"];
