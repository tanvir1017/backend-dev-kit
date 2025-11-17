import {
  GoodTypes,
  PackageQcDetails,
  Packages,
  Prisma,
  UserRole,
} from "@prisma/client";
import { HttpStatusCode } from "axios";
import { calculatePagination } from "../../../../../lib/utils/calcPagination";
import { calculateVolume } from "../../../../../lib/utils/calcVolume";
import AppError from "../../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
} from "../../../../interface/common.interface";
import GlobalRepository from "../../../global/repository/global.repository";
import CurrencyConverter from "../../../payment/utils/CurrencyConversion.utils";
import { calculateTotalQCDimensions } from "../../../payment/utils/qcDetailsCalc";
import { userRepository } from "../../../user-account/user/repository/user.repository";
import PackageRepo from "../repository/packages.repository";
import {
  I_PackageQcDetailsPayload,
  I_PackagesGetPayload,
} from "../types/packages.types";

export default class PackageService {
  private pkgRepo: PackageRepo;
  private globalRepo: GlobalRepository;
  constructor() {
    this.pkgRepo = new PackageRepo();
    this.globalRepo = new GlobalRepository();
  }

  async getThepackageById(id: string) {
    const pkg = await this.pkgRepo.getPackageByItsId({
      where: {
        id,
      },
      select: {
        packageStatus: true,
        remarks: true,
        willDeliveredBy: {
          select: {
            id: true,
            name: true,
            shippingTimeRange: true,
            code: true,
          },
        },

        address: {
          select: {
            addressType: true,
            apartment: true,
            city: true,
            coordinates: true,
            country: true,
            isDefault: true,
            state: true,
            street: true,
          },
        },
        CartProduct: {
          select: {
            id: true,
            title: true,
            sku: true,
            qc: true,
            price: true,
            storage: true,
            quantity: true,
            photos: true,
          },
        },

        payment: {
          where: {
            paymentType: "SHIPPING_COST",
          },
          select: {
            amountTotal: true,
            id: true,
          },
        },
      },
    });

    return {
      ...pkg,
      coupon: 0,
      insurance: 0,
      amountOfPayable: 0,
    };
  }

  // get teh packages
  async getAllThePackages(getPkgPayload: I_PackagesGetPayload) {
    const {
      status = "PROCESS_IN_PACKING",
      q,
      ...paginationOpt
    } = getPkgPayload;
    const { limit, skip, page } = calculatePagination(paginationOpt);

    let whereClause: Prisma.PackagesWhereInput = {};

    // filtering through status
    if (status) {
      whereClause.packageStatus = status;
    }

    // searching with the keywords
    // if (q) {
    //   whereClause.OR = [
    //     {
    //       packageQcDetails: buildSearchOR<Prisma.PackageQcDetailsWhereInput>(
    //         ["volume", "length"],
    //         q,
    //       ),
    //     },
    //   ];
    // }

    const [pkg, totalCount] = await Promise.all([
      this.pkgRepo.getThePackages({
        skip,
        take: limit,
        whereClause,
        select: {
          id: true,
          packageStatus: true,
          remarks: true,
          courierCompany: true,
          trackingLink: true,
          trackingNo: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              memberId: true,
            },
          },
          payment: {
            where: {
              status: "SUCCEEDED",
              paymentType: "SHIPPING_COST",
            },

            select: {
              id: true,
              amountSubtotal: true,
              amountTotal: true,
              createdAt: true,
            },
          },
          CartProduct: {
            select: {
              id: true,
              qc: {
                select: {
                  id: true,
                  height: true,
                  length: true,
                  width: true,
                  weight: true,
                  volume: true,
                },
              },
            },
          },
          packageQcDetails: {
            select: {
              volume: true,
              length: true,
              height: true,
              width: true,
              weightGm: true,
            },
          },
        },
      }),

      this.globalRepo.getCollectionCount({
        modelName: "Packages",
        whereCondition: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const transformedResponse = pkg.map((item) => {
      // Calculate total amount by summing the `amountTotal` in the `payment` array
      const totalAmount = item.payment.reduce(
        (sum, payment) => sum + payment.amountTotal,
        0,
      );

      // calculate the total qc of the products in single package
      const qc = item.CartProduct;

      const { totalHeight, totalLength, totalWidth, totalVolume } =
        calculateTotalQCDimensions(qc);

      // Create the transformed object, removing the `payment` array and adding the `totalAmount`
      const { payment, CartProduct, ...rest } = item; // Destructure to remove `payment`

      return {
        ...rest,
        payment: {
          amountSubtotal: totalAmount,
          actualCost: 0,
        },
        totalProductQc: {
          height: totalHeight,
          length: totalLength,
          width: totalWidth,
          volume: totalVolume,
          actualWeight: 0,
        },
      };
    });
    // transform the data

    return {
      meta: {
        limit,
        page,
        totalCount,
        totalPages,
      },
      result: transformedResponse,
    } as I_PaginationResponse<typeof transformedResponse>;
  }

  // get teh packages
  async assignWsOrPa({
    payload,
    user,
  }: {
    payload: {
      pkgId: string;
      wsId: string;
      paId: string;
    };
    user: I_GlobalJwtPayload;
  }) {
    const roles: UserRole[] = ["ADMIN", "SUPER_ADMIN"];
    if (!roles.includes(user.role)) {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "You are not authorized to perform this action!",
      );
    }

    const { paId, wsId } = payload;

    // At a time both can't be added ~ Warehouse stuff only be able to be added for the first time, then the work only be left for purchasing agent
    // if (
    //   (wsId !== null && paId !== null) ||
    //   (wsId !== undefined && paId !== undefined)
    // ) {
    //   throw new AppError(
    //     HttpStatusCode.BadRequest,
    //     "You can only assign either warehouse staff or purchasing agent to the package at the same time",
    //   );
    // }

    if (wsId) {
      // check if the warehouse staff exist or not
      const isWsExist = await userRepository.getUserById(payload.wsId);

      if (!isWsExist) {
        throw new AppError(
          HttpStatusCode.NotFound,
          "Warehouse agent not found!",
        );
      }
      // update the package information
      return await this.pkgRepo.updatePackage({
        id: payload.pkgId,
        payload: {
          ws: {
            connect: {
              id: payload.wsId,
            },
          },
        },
      });
    } else {
      // check if the purchasing agent exist or not
      // check if the warehouse staff exist or not
      const isPaExist = await userRepository.getUserById(payload.paId);

      if (!isPaExist) {
        throw new AppError(
          HttpStatusCode.NotFound,
          "Purchasing agent not found!",
        );
      }

      // update the package information
      return await this.pkgRepo.updatePackage({
        id: payload.pkgId,
        payload: {
          pa: {
            connect: {
              id: payload.paId,
            },
          },
        },
      });
    }
  }

  /**
   * Update the package details only.
   ** Updatable fields:
   ** 1. Tracking No
   ** 2. Courier Company
   ** 3. Tracking Link
   ** 4. Type of Goods
   ** 5. Status
   */

  async updatePackageDetails(
    payload: {
      pkgId: string;
      trackingNo: string;
      courierCompany: string;
      trackingLink: string;
      typeOfGoods: GoodTypes[];
      status: string;
    },
    user: I_GlobalJwtPayload,
  ) {
    if (user.role !== "WAREHOUSE_STAFF") {
      throw new AppError(
        HttpStatusCode.Forbidden,
        "Only warehouse staff can update the package details!",
      );
    }

    const { pkgId, ...rest } = payload;
    const checkIfThePkgIsExist = await this.pkgRepo.getPackageByItsId({
      where: {
        id: pkgId,
      },
    });

    if (!checkIfThePkgIsExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Package not found for this package!",
      );
    }

    return this.pkgRepo.updatePackage({
      id: pkgId,
      payload: rest,
    });
  }

  // Update package qc details
  async updateOrCreatePackageQcDetails({
    payload,
    user,
  }: {
    user: I_GlobalJwtPayload;
    payload: I_PackageQcDetailsPayload;
  }) {
    const { pkgId, pkgQcDetails } = payload;

    // get the user details and see proper permissions

    // first check the package is exist or not
    const packageExist = (await this.pkgRepo.getPackageByItsId({
      where: {
        id: pkgId,
      },
      include: {
        packageQcDetails: true,
      },
    })) as Packages & {
      packageQcDetails: PackageQcDetails | null;
    };

    if (!packageExist) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "Package not found for this package!",
      );
    }

    // calculating the volume
    const calcPkgQcVolume = calculateVolume({
      heightCm: pkgQcDetails.height,
      lengthCm: pkgQcDetails.length,
      widthCm: pkgQcDetails.width,
    });

    // if there is no package qc details then create
    if (!packageExist?.packageQcDetails) {
      const linkPkgId = {
        connect: {
          id: pkgId,
        },
      };

      const pkgQcDetailsId = await this.pkgRepo.createPackageQcDetailsIntoDB({
        actualWeight: pkgQcDetails.actualWeight,
        height: pkgQcDetails.height,
        length: pkgQcDetails.length,
        package: linkPkgId,
        volume: calcPkgQcVolume,
        weightGm: pkgQcDetails.weightGm,
        width: pkgQcDetails.width,
        actualCost: CurrencyConverter.toCents(pkgQcDetails.actualCost),
      });

      return {
        isCreated: true,
        result: pkgQcDetailsId,
      };
    } else {
      // update the qc details
      const updateQcDetails = await this.pkgRepo.updatePackageQcDetailsIntoDB({
        pkgId: packageExist.packageQcDetails.id,
        payload: {
          actualWeight: pkgQcDetails.actualWeight,
          height: pkgQcDetails.height,
          length: pkgQcDetails.length,
          volume: calcPkgQcVolume,
          weightGm: pkgQcDetails.weightGm,
          width: pkgQcDetails.width,
          actualCost: CurrencyConverter.toCents(pkgQcDetails.actualCost),
        },
      });

      return {
        isCreated: false,
        result: updateQcDetails,
      };
    }
  }
}
