// ESM
import Fastify from "fastify";
import dbConnector from "./src/app/db/db-connector";
import routes from "./src/app/routes";

// Logger
const fastify = Fastify({
  logger: true,
});

// db connections
fastify.register(dbConnector);

// get routes
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

fastify.register(routes);

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
