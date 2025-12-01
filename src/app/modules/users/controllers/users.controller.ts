import { Elysia } from "elysia";
import { userServicesV1 } from "../services/users.service";

export const userControllerV1 = new Elysia({
  prefix: "/users",
  name: "Controller.UserV1",
})
  // .user(userReqValidator)
  .use(userServicesV1)
  .get("/", async ({ getUserById }) => {
    return await getUserById("some-user-id");
  })

  // .get() // "path", handler, schema
  .post("/", async ({ createUser }) => {
    const newUser = {
      id: "new-user-id",
      name: "John Doe",
      email: "john.doe@example.com",
    };
    return await createUser(newUser);
  });
// .put()
// .delete()
