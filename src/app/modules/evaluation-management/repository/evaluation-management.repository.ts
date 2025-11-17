import { EvaluationManagement } from "@prisma/client";
import prisma from "../../../../lib/utils/prisma.utils";

// ** get all evaluating management
const getAllEvaluatingManagement = async (
  limit: number,
  skip: number,
  query?: Record<string, any>,
) => {
  return await prisma.evaluationManagement.findMany({
    take: limit,
    skip,
  });
};

// ** get single Evaluating Management
const getSingleEvaluatingManagement = async (id: string) => {
  return await prisma.evaluationManagement.findFirst({
    where: { id },
  });
};

// ** create new EvaluationManagement
const createNewEvaluationManagement = async (payload: EvaluationManagement) => {
  return await prisma.evaluationManagement.create({
    data: payload,
  });
};

// ** update EvaluationManagement
const updateEvaluationManagement = async (
  id: string,
  payload: Partial<EvaluationManagement>,
) => {
  return await prisma.evaluationManagement.update({
    where: { id },
    data: payload,
  });
};

// ** get Evaluation Management count
const getEvaluationManagementCount = async () => {
  return await prisma.evaluationManagement.count();
};

// ** delete Evaluation Management
const deleteEvaluationManagement = async (id: string) => {
  return await prisma.evaluationManagement.delete({
    where: { id },
  });
};

export const evaluationManagementRepository = {
  getAllEvaluatingManagement,
  getSingleEvaluatingManagement,
  getEvaluationManagementCount,
  createNewEvaluationManagement,
  updateEvaluationManagement,
  deleteEvaluationManagement,
};
