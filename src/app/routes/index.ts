import { Router } from "express";

import sendResponse from "../../lib/utils/sendResponse";
import env from "../config/clean-env";
import { AdvertisingRoutes } from "../modules/advertising/routes/advertising.routes";
import { authRoutes } from "../modules/auth/routes/auth.routes";
import { BlogRoutes } from "../modules/blog/routes/blog.routes";
import { BulletinRouter } from "../modules/bulletin/routes/bulletin.routes";
import { contactUsRoutes } from "../modules/contact-us/routes/contact-us.routes";
import { CouponRoutes } from "../modules/coupon-management/routes/coupon-management.routes";

import { EvaluationManagementRoutes } from "../modules/evaluation-management/routes/evaluation-management.routes";
import { FAQRoutes } from "../modules/faq/routes/faq.routes";
import { HelpCenterRoutes } from "../modules/help-center/routes/help-center.routes";
import { MembershipLevelRoutes } from "../modules/membership-level/routes/membership-level.routes";
import { openFGARoutes } from "../modules/openFGA/routes/openFGA.routes";
import { orderRoutes } from "../modules/orders/routes/orders.routes";
import { paymentRotes } from "../modules/payment/routes/payment.routes";
import { promotionLevelRouter } from "../modules/promotion-level/routes/promotion-level.routes";
import { serviceManagementRoutes } from "../modules/service-management/routes/service-management.routes";
import { SocialMediaRoutes } from "../modules/social-media/routes/social-media.routes";
import { taobaoRoutes } from "../modules/taobao/routes/taobao.routes";
import { TopUpRoutes } from "../modules/top-up/routes/top-up.routes";

import { HttpStatusCode } from "axios";
import { FavoriteRoutes } from "../modules/favourite/routes/favourite.routes";
import { ShippingProviderRoutes } from "../modules/international-shipping-management/routes/international-shipping-management.routes";
import { UserAccRoutes } from "../modules/user-account/u-account/routes/u-account.routes";
import { UserRoutes } from "../modules/user-account/user/routes/user.route";
import { WarehouseRoutes } from "../modules/warehouse-management/routes/warehouse-management.routes";
import { whatsappContactRouter } from "../modules/whatsapp-contact/routes/whatsapp-contact.routes";

const routes = Router();

export type T_RouteModules = { path: string; routes: Router };

const routesModule: T_RouteModules[] = [
  {
    path: "/users",
    routes: UserRoutes,
  },
  {
    path: "/auth",
    routes: authRoutes,
  },
  {
    path: "/taobao",
    routes: taobaoRoutes,
  },
  {
    path: "/contact-us",
    routes: contactUsRoutes,
  },
  {
    path: "/promotional-levels",
    routes: promotionLevelRouter,
  },
  {
    path: "/whatsapp-contact",
    routes: whatsappContactRouter,
  },
  {
    path: "/social-media",
    routes: SocialMediaRoutes,
  },
  {
    path: "/bulletins",
    routes: BulletinRouter,
  },
  {
    path: "/blogs",
    routes: BlogRoutes,
  },
  {
    path: "/advertising",
    routes: AdvertisingRoutes,
  },
  {
    path: "/help-center-info",
    routes: HelpCenterRoutes,
  },
  {
    path: "/faqs",
    routes: FAQRoutes,
  },
  {
    path: "/service-managements",
    routes: serviceManagementRoutes,
  },
  {
    path: "/evaluation-management",
    routes: EvaluationManagementRoutes,
  },
  {
    path: "/coupons",
    routes: CouponRoutes,
  },
  {
    path: "/membership-levels",
    routes: MembershipLevelRoutes,
  },
  {
    path: "/shipping-providers",
    routes: ShippingProviderRoutes,
  },
  {
    path: "/warehouses",
    routes: WarehouseRoutes,
  },

  // Permissions openFGA
  {
    path: "/permissions",
    routes: openFGARoutes,
  },

  {
    path: "/cart-and-order",
    routes: orderRoutes,
  },
  {
    path: "/stripe",
    routes: paymentRotes,
  },
  {
    path: "/top-up",
    routes: TopUpRoutes,
  },
  {
    path: "/user-acc",
    routes: UserAccRoutes,
  },
  {
    path: "/fav",
    routes: FavoriteRoutes,
  },

  // Extra but
  {
    path: "/route-lists",
    routes: routes.get("/", async (req, res) => {
      sendResponse(res, {
        statusCode: HttpStatusCode.Ok,
        success: true,
        message: "Route Lists",
        data: routesModule.map(
          (item: T_RouteModules) =>
            `${env.isDev ? env.LOCAL_BACKEND_URL : env.PROD_BACKEND_URL}/api/v1/${item.path}`,
        ),
      });
    }),
  },
];

// TODO: Implement routes here
routesModule.forEach((item: T_RouteModules) =>
  routes.use(item.path, item.routes),
);

export default routes;
