import meiliClient from "../../app/config/meili-search";
import prisma from "../../lib/utils/prisma.utils";

class MeiliHelper {
  constructor() {}

  /**
   * Flatten an order for Meilisearch
   */
  flattenOrderForSearch(order: any) {
    return {
      id: order.id,
      totalPrice: order.totalPrice,
      localDeliveryFee: order.localDeliveryFee,
      serviceAddonFees: order.serviceAddonFees,
      customerRemark: order.customerRemark,
      productStatus: order.productStatus,
      orderStatus: order.orderStatus,
      userId: order.userId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      carts: order.carts.map((c: any) => ({
        id: c.id,
        title: c.title,
        shortDesc: c.shortDesc,
        quantity: c.quantity,
        price: c.price,
        deliveryFee: c.deliveryFee,
        taobao_num_iid: c.taobao_num_iid,
        photos: c.photos,
        qc: c.qc.map((q: any) => ({
          length: q.length,
          width: q.width,
          height: q.height,
          weight: q.weight,
          volume: q.volume,
          typeOfGoods: q.typeOfGoods,
          remark: q.remark,
        })),
      })),
      serviceAddons: order.OrderAddons?.map((a: any) => ({
        id: a.id,
        service: a.service,
        fee: a.fee,
      })),
      payments: order.payment?.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
      })),
    };
  }

  async syncOrderToSearch(orderId: string) {
    const index = await meiliClient.getIndex("orders");

    // Fetch order with relations
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        carts: {
          include: {
            qc: true,
          },
        },
        OrderAddons: true,
        payment: true,
      },
    });

    if (!order) return;

    const doc = this.flattenOrderForSearch(order);

    // Add or update document in Meilisearch
    await index.addDocuments([doc]);
  }
}
