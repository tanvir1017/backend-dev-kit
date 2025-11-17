import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import { I_PaginationOptions } from "../../../../lib/utils/calcPagination";
import sendResponse from "../../../../lib/utils/sendResponse";
import { membershipService } from "../service/membership-level.service";

// ** get all membership level
const getAllMembershipLevels = asyncHandler(async (req, res) => {
  const results = await membershipService.getAllMembershipLevels(req.query);
  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting all membership level success",
    data: results,
  });
});

// ** get memberShipLevel by id
const getSingleMembershipLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = req.query as typeof req.query & Pick<I_PaginationOptions, "fc">;

  const memberShipLevel = await membershipService.getSingleMembershipLevel({
    id,
    query,
  });

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Getting single MemberShip level success",
    data: memberShipLevel,
  });
});

// ** create new memberShipLevel
const createNewMembershipLevel = asyncHandler(async (req, res) => {
  const memberShipLevel = await membershipService.createNewMembershipLevel(
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Created,
    message: "Membership level created successfully",
    data: memberShipLevel,
  });
});

// ** update memberShipLevel
const updateMembershipLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const memberShipLevel = await membershipService.updateMembershipLevel(
    id,
    req.body,
  );

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Membership level updated successfully!",
    data: memberShipLevel,
  });
});

// ** get memberShipLevel by id
const deleteMembershipLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await membershipService.deleteMembershipLevel(id);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Deleting MemberShip level success",
    data: null,
  });
});

// ** Get user's member ship level
const getUserMembershipLevel = asyncHandler(async (req, res) => {
  const query = req.query as I_PaginationOptions & { q?: string };
  const response = await membershipService.getUserMembershipLevel(query);

  sendResponse(res, {
    success: true,
    statusCode: HttpStatusCode.Ok,
    message: "Retrieve user membership list",
    data: response,
  });
});

export const memberShipLevelController = {
  getUserMembershipLevel,
  getAllMembershipLevels,
  getSingleMembershipLevel,
  createNewMembershipLevel,
  updateMembershipLevel,
  deleteMembershipLevel,
};
