import { Router } from "express";

import { HttpStatusCode } from "axios";
import { T_RouteModules } from ".";
import sendResponse from "../../lib/utils/sendResponse";
import env from "../config/clean-env";
import { AssignPARoutes } from "../modules/dashboard/assign-pa-and-ws/routes/assign-pa.routes";
import { DashUserRoutes } from "../modules/dashboard/dashboard-user/routes/dashboard-user.route";
import { pkgRouter } from "../modules/dashboard/packages/routes/packages.routes";
import { ProductsRoutes } from "../modules/dashboard/products/routes/products.routes";
import { exchangeRoute } from "../modules/exchange-rate/routes/exchange-rate.routes";
import { WarehouseRoutes } from "../modules/warehouse-management/routes/warehouse-management.routes";

const dashboardRoutes = Router();

const routesModule: T_RouteModules[] = [
  {
    path: "/products",
    routes: ProductsRoutes,
  },
  {
    path: "/pkg",
    routes: pkgRouter,
  },
  {
    path: "/assign",
    routes: AssignPARoutes,
  },
  {
    path: "/warehouses",
    routes: WarehouseRoutes,
  },
  {
    path: "/users",
    routes: DashUserRoutes,
  },
  {
    path: "/exchange-rate",
    routes: exchangeRoute,
  },

  // Extra but
  {
    path: "/route-lists",
    routes: dashboardRoutes.get("/", async (req, res) => {
      sendResponse(res, {
        statusCode: HttpStatusCode.Ok,
        success: true,
        message: "Dashboard Route Lists",
        data: routesModule.map(
          (item: T_RouteModules) =>
            `${env.isDev ? env.LOCAL_BACKEND_URL : env.PROD_BACKEND_URL}/api/v1/dashboard/${item.path}`,
        ),
      });
    }),
  },
];

// TODO: Implement routes here
routesModule.forEach((item: T_RouteModules) =>
  dashboardRoutes.use(item.path, item.routes),
);

export default dashboardRoutes;
