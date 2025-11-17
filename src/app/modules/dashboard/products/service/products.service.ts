import { Prisma, QcDetails, ServiceManagement } from "@prisma/client";
import { HttpStatusCode } from "axios";
import { urlFrontEnd } from "../../../../../lib/utils/baseUrl";
import { calculatePagination } from "../../../../../lib/utils/calcPagination";
import { calculateVolume } from "../../../../../lib/utils/calcVolume";
import { bucketStorageService } from "../../../../../lib/utils/upload-digital-ocean";
import { qcUpdateAddEmailTemplate } from "../../../../emails/templates/qc-update-ad-e-temaplate";
import AppError from "../../../../errors/appError";
import {
  I_GlobalJwtPayload,
  I_PaginationResponse,
  T_PrismaModelOmittedProp,
} from "../../../../interface/common.interface";
import { queueEmail } from "../../../../queue/queues/email/email-service";
import GlobalRepository from "../../../global/repository/global.repository";
import OrderRepository from "../repository/products.repository";
import {
  I_CngProductStatusProps,
  I_GetAllOrdersQuery,
  T_DeleteQcPhotos,
  T_QcDetails,
} from "../types/products.types";

const globalRepository = new GlobalRepository();
class ProductService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }
  async getAllOrders(
    payload: I_GetAllOrdersQuery,
    user: I_GlobalJwtPayload,
  ): Promise<I_PaginationResponse<any>> {
    const { productStatus, search, ...rest } = payload;

    const whereClause: Prisma.CartProductWhereInput = {};

    if (user.role === "PURCHASING_AGENT") {
      whereClause.Order = {
        productStatus: "PENDING_PURCHASE",
        pa_wh: {
          purchasingAgentId: user.id, // where logged in user is the purchasing agent
        },
      };
    }

    if (user.role === "WAREHOUSE_STAFF") {
      whereClause.Order = {
        productStatus: "PURCHASED",
        pa_wh: {
          wareHouseStuffId: user.id, // where logged in user is the purchasing agent
        },
      };
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        {
          Order: {
            user: {
              memberId: {
                contains: search,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          },
        },
      ];
    }

    if (productStatus && whereClause?.Order) {
      whereClause.Order.productStatus = productStatus;
    }

    const { limit, skip, page, sortBy, sortOrder } = calculatePagination(rest);

    const [totalItems, cartProducts] = await Promise.all([
      // Getting the total count
      globalRepository.getCollectionCount({
        modelName: "CartProduct",
        whereCondition: whereClause,
      }),
      // Get all the order
      this.orderRepository.getAllCarts({
        props: {
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        },
        whereClause: whereClause,
        select: {
          id: true,
          title: true,
          taobao_num_iid: true,
          price: true,
          quantity: true,
          sku: true,
          //deliveryFee: true,
          createdAt: true,
          updatedAt: true,
          Order: {
            select: {
              id: true,
              serviceAddonFees: true,
              localDeliveryFee: true,
              productStatus: true,
              totalPrice: true,
              customerRemark: true,

              user: {
                select: {
                  id: true,
                  memberId: true,
                  email: true,
                },
              },

              // addons
              OrderAddons: {
                select: {
                  service: {
                    select: {
                      id: true,
                      orderType: true,
                      service: true,
                      fee: true,
                      typeOfCharge: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    // Transform the orders to flatten OrderAddons
    const transformedOrders = cartProducts.map((c_product) => {
      const orderAddons =
        // @ts-ignore
        (c_product.Order?.OrderAddons as ServiceManagement[]) || [];

      if (c_product.Order && orderAddons.length > 0) {
        const transformedAddons = orderAddons.map(
          (addon: Partial<ServiceManagement>) => addon.service,
        );

        return {
          ...c_product,
          Order: {
            ...c_product.Order,
            OrderAddons: transformedAddons, // Now this is a flat array of service objects
          },
        };
      }

      return c_product; // Return as is if no transformation needed
    });

    return {
      meta: {
        limit,
        page,
        totalCount: totalItems,
        totalPages,
      },
      result: transformedOrders, // Return the transformed orders
    };
  }

  // change the products status
  async changeProductStatus({
    user,
    payload,
  }: {
    user: I_GlobalJwtPayload;
    payload: I_CngProductStatusProps;
  }) {
    // Get the product first
    const getProduct = await this.orderRepository.getOrderById({
      orderId: payload.productId,
    });

    if (!getProduct) {
      throw new AppError(HttpStatusCode.NotFound, "Order not found!");
    }

    // check if the user is admin or not

    // check validation
    const result = await this.orderRepository.changeProductStatusInDb({
      productId: payload.productId,
      productStatus: payload.status,
    });
    return result;
    //return getProduct;
  }

  //////////////////////////////////////////////////////////////////////////////////////////
  // _> Qc Details ~ Modules
  //////////////////////////////////////////////////////////////////////////////////////////

  // Add the qc details
  async addQcDetails({
    user,
    payload,
    files,
  }: {
    user: I_GlobalJwtPayload;
    payload: T_QcDetails["body"] & {
      notifyUser: boolean;
    };
    files: {
      images: Express.Multer.File[];
    };
  }) {
    // Get the product first
    const getProduct = await this.orderRepository.getProductById({
      productId: payload.cartProductId,
      select: {
        Order: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!getProduct) {
      throw new AppError(HttpStatusCode.NotFound, "Product not found!");
    }

    // calculate the volume
    const calcVolume = calculateVolume({
      lengthCm: payload.height,
      widthCm: payload.height,
      heightCm: payload.height,
    });

    let payloadBody: Omit<QcDetails, T_PrismaModelOmittedProp> = {
      height: payload.height,
      cartProductId: payload.cartProductId,
      length: payload.height,
      qcPhotos: [],
      remark: payload.remark ?? "",
      typeOfGoods: payload.typeOfGoods,
      volume: calcVolume,
      weight: payload.height,
      warehouseStuffId: user.id,
      width: payload.height,
    };

    // Handle file uploads if files are provided
    if (files?.images?.length < 0) {
      throw new AppError(HttpStatusCode.BadRequest, "No files provided");
    }
    const uploadedPhotoUrls =
      await bucketStorageService.uploadMultipleToDigitalOcean(
        files.images,
        "qc-images",
      );

    payloadBody.qcPhotos = uploadedPhotoUrls;

    // create the qc
    const result = await this.orderRepository.createQcDetails(payloadBody);

    // send email to the customer
    if (payload.notifyUser && getProduct.Order.user) {
      const { profile } = getProduct.Order.user;
      await this.handleSendEmailToUser({
        email: getProduct.Order.user.email,
        fullName: profile && profile.fullName ? profile.fullName : "",
        firstName: profile && profile.firstName ? profile.firstName : "",
        lastName: profile && profile.lastName ? profile.lastName : "",
        qcPayload: {
          id: result.id,
          typeOfGoods: result.typeOfGoods,
          weight: result.weight,
          volume: result.volume,
          qcPhotos: result.qcPhotos,
        },
      });
    }

    return result;
  }

  // Update the qc details
  async updateQcDetails({
    user,
    payload,
    qcId,
    files = { images: [] },
  }: {
    user: I_GlobalJwtPayload;
    qcId: string;
    payload: Partial<T_QcDetails["body"]> & {
      notifyUser: boolean;
    };
    files: { images: Express.Multer.File[] };
  }): Promise<QcDetails> {
    // Get the existing QC details first to ensure they exist
    const existingQcDetails = await this.orderRepository.getQcDetailsById({
      qcId,
    });

    if (!existingQcDetails) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "QC details not found for this product!",
      );
    }

    // Create update payload with only provided fields
    const updatePayload: Partial<Omit<QcDetails, T_PrismaModelOmittedProp>> = {
      warehouseStuffId: user.id,
    };

    // Only include fields that are provided in payload
    if (payload.height !== undefined) {
      updatePayload.height = payload.height;
    }

    if (payload.length !== undefined) {
      updatePayload.length = payload.length;
    }

    if (payload.width !== undefined) {
      updatePayload.width = payload.width;
    }

    if (payload.weight !== undefined) {
      updatePayload.weight = payload.weight;
    }

    if (payload.typeOfGoods !== undefined) {
      updatePayload.typeOfGoods = payload.typeOfGoods;
    }

    if (payload.remark !== undefined) {
      updatePayload.remark = payload.remark;
    }

    // Recalculate volume if any dimension is updated
    if (
      payload.height !== undefined ||
      payload.length !== undefined ||
      payload.width !== undefined
    ) {
      const finalHeight = payload.height ?? existingQcDetails.height;
      const finalLength = payload.length ?? existingQcDetails.length;
      const finalWidth = payload.width ?? existingQcDetails.width;

      updatePayload.volume = calculateVolume({
        lengthCm: finalLength,
        widthCm: finalWidth,
        heightCm: finalHeight,
      });
    }

    // Handle file uploads if files are provided
    if (files && files.images.length > 0) {
      const uploadedPhotoUrls =
        await bucketStorageService.uploadMultipleToDigitalOcean(
          files.images,
          "qc-images",
        );
      updatePayload.qcPhotos = [
        ...existingQcDetails.qcPhotos,
        ...uploadedPhotoUrls,
      ];
    }

    // Update the QC details

    const updatedResult = await this.orderRepository.updateQcDetails({
      qcId,
      payload: updatePayload,

      select: {
        id: true,
        remark: true,
        createdAt: true,
        updatedAt: true,
        height: true,
        weight: true,
        width: true,
        volume: true,
        length: true,
        qcPhotos: true,
        typeOfGoods: true,
        warehouseStuffId: true,
        CartProduct: {
          select: {
            id: true,
            Order: {
              select: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    profile: {
                      select: {
                        firstName: true,
                        lastName: true,
                        fullName: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // send email to the user too
    if (payload.notifyUser && updatedResult.CartProduct.Order.user) {
      const { profile } = updatedResult.CartProduct.Order.user;
      await this.handleSendEmailToUser({
        email: updatedResult.CartProduct.Order.user.email,
        fullName: profile && profile.fullName ? profile.fullName : "",
        firstName: profile && profile.firstName ? profile.firstName : "",
        lastName: profile && profile.lastName ? profile.lastName : "",
        qcPayload: {
          id: qcId,
          typeOfGoods: updatedResult.typeOfGoods,
          weight: updatedResult.weight,
          volume: updatedResult.volume,
          qcPhotos: updatedResult.qcPhotos,
        },
      });
    }

    return {
      id: updatedResult.id,
      height: updatedResult.height,
      weight: updatedResult.weight,
      width: updatedResult.width,
      volume: updatedResult.volume,
      length: updatedResult.length,
      qcPhotos: updatedResult.qcPhotos,
      typeOfGoods: updatedResult.typeOfGoods,
      cartProductId: updatedResult.CartProduct.id,
      warehouseStuffId: updatedResult.warehouseStuffId,
      remark: updatedResult.remark,
      createdAt: updatedResult.createdAt,
      updatedAt: updatedResult.updatedAt,
    };
  }

  // Delete the qc details
  async deleteQcDetails({ qcId }: { qcId: string }) {
    // Get the existing QC details first to ensure they exist
    const existingQcDetails = await this.orderRepository.getQcDetailsById({
      qcId,
    });

    if (!existingQcDetails) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "QC details not found for this product!",
      );
    }

    // Update the QC details
    return await this.orderRepository.deleteQcDetailsFromDb({
      qcId,
    });
  }

  // delete the qc details photos only
  async deleteQcPhotos({
    user,
    payload,
  }: {
    user: I_GlobalJwtPayload;
    payload: T_DeleteQcPhotos;
  }) {
    // check first if the qc details exist
    const qcDetails = await this.orderRepository.getQcDetailsById({
      qcId: payload.qcId,
    });

    if (!qcDetails) {
      throw new AppError(
        HttpStatusCode.NotFound,
        "QC details not found for this product!",
      );
    }

    // Get rid of the images that need to be deleted
    const newQcPhotos = qcDetails.qcPhotos.filter(
      (photo) => photo !== payload.imageLink,
    );

    // delete the image also from the digital ocean
    const response = await bucketStorageService.deleteFromDigitalOceanAWS(
      payload.imageLink,
    );

    return await this.orderRepository.updateQcDetails({
      qcId: payload.qcId,
      payload: {
        qcPhotos: newQcPhotos,
      },
    });
  }

  async handleSendEmailToUser({
    email,
    fullName,
    firstName,
    lastName,
    qcPayload,
  }: {
    email: string;
    fullName: string;
    firstName: string;
    lastName: string;
    qcPayload: Pick<
      QcDetails,
      "id" | "typeOfGoods" | "weight" | "volume" | "qcPhotos"
    >;
  }) {
    // concatenating the user information
    const fullNameConc = fullName ? fullName : `${firstName} ${lastName}`;

    const emailTemplate = qcUpdateAddEmailTemplate({
      qcId: qcPayload.id,
      typeOfGoods: qcPayload.typeOfGoods,
      weight: String(qcPayload.weight),
      volume: String(qcPayload.volume),
      qcPhotosOrVideos: `📷 ${qcPayload.qcPhotos?.length} photos/videos attached to this QC report`,
      homepageLink: urlFrontEnd,
      supportLink: `${urlFrontEnd}/support`,
      qcReportLink: `${urlFrontEnd}/user/qc/${qcPayload.id}`,
    });

    await queueEmail({
      to: email,
      subject: `Your QC report is ready!`,
      html: emailTemplate,
    });
  }
}
export default ProductService;
