import { Elysia } from "elysia";

export const v1Routes = new Elysia({ prefix: "/api/v1" })
  //.use(authControllerV1)
  .use(userControllerV1);
