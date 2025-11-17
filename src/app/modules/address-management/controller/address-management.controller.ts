import { HttpStatusCode } from "axios";
import asyncHandler from "../../../../lib/utils/async-handler";
import sendResponse from "../../../../lib/utils/sendResponse";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import AddressService from "../service/address-management.service";

class AddressController {
  private addressService: AddressService;

  constructor() {
    this.addressService = new AddressService();
  }

  // ** Get single address by ID
  getAddress = asyncHandler(async (req, res) => {
    const user = req.user as I_GlobalJwtPayload;
    const { addressId } = req.params;

    const result = await this.addressService.getAddress({
      user,
      addressId,
    });

    sendResponse(res, {
      statusCode: HttpStatusCode.Ok,
      message: "Address retrieved successfully!",
      success: true,
      data: result,
    });
  });

  //   // ** Get all addresses for a user
  //   getUserAddresses = asyncHandler(async (req, res) => {
  //     const user = req.user as I_GlobalJwtPayload;
  //     const { userId } = req.params;
  //     const query = req.query as T_GetUserAddressesQuery;

  //     const result = await this.addressService.getUserAddresses({
  //       user,
  //       userId,
  //       query,
  //     });

  //     sendResponse(res, {
  //       statusCode: HttpStatusCode.Ok,
  //       message: "User addresses retrieved successfully!",
  //       success: true,
  //       data: result,
  //     });
  //   });

  //   // ** Update address
  //   updateAddress = asyncHandler(async (req, res) => {
  //     const user = req.user as I_GlobalJwtPayload;
  //     const { addressId } = req.params;
  //     const body = req.body as T_UpdateAddress;

  //     const result = await this.addressService.updateAddress({
  //       user,
  //       addressId,
  //       payload: body,
  //     });

  //     sendResponse(res, {
  //       statusCode: HttpStatusCode.Ok,
  //       message: "Address updated successfully!",
  //       success: true,
  //       data: result,
  //     });
  //   });

  //   // ** Delete address
  //   deleteAddress = asyncHandler(async (req, res) => {
  //     const user = req.user as I_GlobalJwtPayload;
  //     const { addressId } = req.params;

  //     const result = await this.addressService.deleteAddress({
  //       user,
  //       addressId,
  //     });

  //     sendResponse(res, {
  //       statusCode: HttpStatusCode.Ok,
  //       message: "Address deleted successfully!",
  //       success: true,
  //       data: result,
  //     });
  //   });

  //   // ** Set address as default
  //   setDefaultAddress = asyncHandler(async (req, res) => {
  //     const user = req.user as I_GlobalJwtPayload;
  //     const { addressId } = req.params;

  //     const result = await this.addressService.setDefaultAddress({
  //       user,
  //       addressId,
  //     });

  //     sendResponse(res, {
  //       statusCode: HttpStatusCode.Ok,
  //       message: "Address set as default successfully!",
  //       success: true,
  //       data: result,
  //     });
  //   });
}

export default AddressController;
