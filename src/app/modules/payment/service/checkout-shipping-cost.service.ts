import { PackageStatus } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { computeShippingPrice } from "../../../../lib/utils/getComputedShippingPrice";
import AppError from "../../../errors/appError";
import { I_GlobalJwtPayload } from "../../../interface/common.interface";
import AddressRepository from "../../address-management/repository/address-management.repository";
import PackageRepo from "../../dashboard/packages/repository/packages.repository";
import OrderRepository from "../../dashboard/products/repository/products.repository";
import ShippingProviderRepository from "../../international-shipping-management/repository/international-shipping-management.repository";
import StripeRepository from "../../stripe/repository/stripe.repository";
import { T_PackagePayload } from "../../user-account/u-account/types/u-account.types";
import { calculateTotalQCDimensions } from "../utils/qcDetailsCalc";

const shippingRepository = new ShippingProviderRepository();
const stripeRepository = new StripeRepository();
const orderRepository = new OrderRepository();
const addressRepository = new AddressRepository();
const pkgRepo = new PackageRepo();
async function getShippingCostIntent({
  user,
  payload,
}: {
  user: I_GlobalJwtPayload;
  payload: T_PackagePayload;
}) {
  const { products } = payload;

  // check is the address valid or not
  const isAddressIsValid = await addressRepository.getAddressById({
    whereClause: {
      userId: user.id,
      id: payload.addressId,
    },
  });

  // const countryValidation = getCountryCode(isAddressIsValid.country);

  if (!isAddressIsValid) {
    throw new AppError(HttpStatusCode.NotFound, "Address not found!");
  }

  // check the product is valid or not and belongs to the paying user
  const isValidProducts = await orderRepository.getProductByIds({
    productIds: products,
    userId: user.id,
    select: {
      qc: {
        select: {
          id: true,
          length: true,
          width: true,
          height: true,
          volume: true,
        },
      },
    },
  });

  if (!isValidProducts || !isValidProducts.length) {
    throw new AppError(HttpStatusCode.NotFound, "Invalid products!");
  }

  // calculate the  shipping cost from the product L and W and H and volume ratio
  // first get the shipping provider by id
  const isShippingProviderExist = await shippingRepository.findById({
    id: payload.shippingId,
    select: {
      id: true,
      name: true,
      code: true,
      nation: true,
      continueG: true,
      firstCharge: true,
      volumeRatio: true,
      firstWeightG: true,
      floatingWeight: true,
      freeShippingAmt: true,
      renewalCharge: true,
    },
  });

  if (!isShippingProviderExist) {
    throw new AppError(HttpStatusCode.NotFound, "Shipping provider not found!");
  }

  if (
    isShippingProviderExist.nation.toLowerCase() !==
    isAddressIsValid.country.toLowerCase()
  ) {
    throw new AppError(
      HttpStatusCode.NotFound,
      "Based on your address shipping is not available!",
    );
  }

  // calculating total cost for the selected products(parcel making)

  const { totalHeight, totalLength, totalWidth } =
    calculateTotalQCDimensions(isValidProducts);

  // calculating the shipping cost
  const shippingCost = computeShippingPrice(isShippingProviderExist, {
    actualWeightG: 0,
    heightCm: totalHeight,
    lengthCm: totalLength,
    widthCm: totalWidth,
  });

  // create a package with that amount, update the cartProduct,
  const createPkg = await pkgRepo.createPackage({
    addressId: payload.addressId,
    courierCompany: isShippingProviderExist.name,
    willDeliveredById: payload.shippingId,
    packageStatus: PackageStatus.WAITING_FOR_PAYMENT_CONFIRMATION,
    userId: user.id,
    remarks: payload.remarks || "N/A",
  });

  // add the product to the package
  await orderRepository.updateProductsMongoNative(products, createPkg.id);

  // initiate the checkout payment process
  const checkoutSession = await stripeRepository.initializeShippingPayment({
    customerInfo: {
      userId: user.id,
      email: user.email,
    },
    pay: {
      cost: shippingCost,
      productId: products,
    },
    orderMetaData: {
      type: "SHIPPING_COST",
      packageId: createPkg.id,
      userId: user.id,
    },
  });

  return {
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
  };

  //return the stripe checkout link and session id
}

export default getShippingCostIntent;
