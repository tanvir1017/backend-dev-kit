import http, { Server } from "http";
import { Server as SocketIO_Server } from "socket.io";
import app from "./app";
import env from "./app/config/clean-env";
import corsOptions from "./app/config/corsOption";
import { createEmailWorker } from "./app/queue/worker/email-worker";
import getLocalIPAddress from "./lib/utils/getLocalIpAdd";
import seedSuperAdmin from "./lib/utils/seeding-super-admin";

let server: Server;

// Server initialization (server.ts)
server = http.createServer(app);

// init the socket
// At the top of your server file (where you initialize Socket.IO)
export const io = new SocketIO_Server(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"], // ✅ Required for Docker
  allowUpgrades: true,
});

let workers: {
  email: any;
} = {
  email: null,
};
// Initializing the server
async function startServer() {
  try {
    // console.log("📌 Starting main function...");
    // console.log("📦 PORT:", env.PORT);

    //await ensureFGAStoreAndModel();

    console.log("⛏ Seeding admin...");
    await seedSuperAdmin();

    // assigning workers to variables
    workers.email = createEmailWorker();

    console.log("🌱 admin seeded");

    // Start server
    server.listen(Number(env.PORT), "0.0.0.0", () => {
      console.log("🚀 Server running at:");
      console.log(`  ➜ Local:   http://localhost:${env.PORT}`);
      console.log(`  ➜ Network: http://${getLocalIPAddress()}:${env.PORT}`);
      console.log(`  ➜ Available: http://0.0.0.0:${env.PORT}`);
    });

    // Make io accessible globally
  } catch (error: any) {
    console.error(`⚠️☠️ Server closed by error: ${(error as Error).message}`);
    await workers?.email?.close();
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (m, reason) => {
  console.log("⚠️☠️ Server closed by unhandledRejection", reason);
  // console.log("🚀 ~ process.on ~ server:", m);

  // unhandled rejection
  if (server) {
    console.log("+++++++++++++ Because of server still exist +++++++++++++");
    server.close(async () => {
      await workers?.email?.close();
      process.exit(1);
    });
  }

  console.log("+++++++++++++ Server is not exist +++++++++++++");
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.log("⚠️☠️ Server closed by uncaught exception", error.stack || error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
