import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import passport from "passport";
import path from "path";
import corsOptions from "./app/config/corsOption";
import globalErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import { googleStrategy } from "./app/modules/auth/utils/oAuthStrategies/google.strategy";
import { WebhookController } from "./app/modules/stripe/controller/stripe.controller";
import { userServices } from "./app/modules/user-account/user/service/user.service";
import { emailQueue } from "./app/queue/queues/email/email-queue";
import routes from "./app/routes";
import dashboardRoutes from "./app/routes/dashboard-routes";
// ** making app variable and store it into express functions
const app: Application = express();

// ** Webhook controller
const StripeWebhook = new WebhookController();

//  **  Cross Origin Resource Sharing // ? now it will receive all the req
app.use(cors(corsOptions));

// ** Stripe Webhook
app.use(
  "/api/v1/_/webhook",
  express.raw({ type: "application/json" }),
  StripeWebhook.handleStripeWebhook,
);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

app.use("/admin/queues", serverAdapter.getRouter());

/**
 * Google oAuth configuration
 * * */

// Configure passport
passport.use(googleStrategy);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userServices.getSingeUserFromDb(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Use passport middleware
app.use(passport.initialize());

// ** Parser
app.use(express.json());

//  ** built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser() as any);

// ** express.static() is a built-in middleware in Express used to serve static files (e.g., images, stylesheets, JavaScript files, fonts, etc.) from a specified directory.
app.use(express.static(path.join(__dirname, "..", "public"))); // Use '..' to move out of the 'src' folder

//** Routing
app.get("/", async (req, res) => {
  res.status(200).json({ message: "checking API health 👩‍⚕️" });
});

//  Using routes for whole application

app.use("/api/v1", routes);
app.use("/api/v1/dashboard", dashboardRoutes);

//  Global error handler Function
app.use(globalErrorHandler as any);

// TODO  => Not Found handler route
app.use(notFound as any);

export default app;
