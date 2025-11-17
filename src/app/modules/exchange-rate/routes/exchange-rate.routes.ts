import { Router } from "express";
import { authenticate } from "../../../middleware/auth";
import sanitizeInputData from "../../../middleware/sanitizeClientDataViaZod";
import { exchangeController } from "../controller/exchange-rate.controller";
import { exchangeRateValidation } from "../validation/exchange-rate.validation";

const exRateRouter = Router();

exRateRouter
  .route("/")
  .post(
    authenticate,
    //requirePermission("EXCHANGE_RATE_MANAGEMENT"),
    sanitizeInputData(exchangeRateValidation.create),
    exchangeController.createAExchangeRate,
  )
  .get(exchangeController.getAll);

exRateRouter.route("/:id").patch(
  authenticate,
  //requirePermission("EVALUATION_MANAGEMENT"),
  sanitizeInputData(exchangeRateValidation.update),
  exchangeController.updateAExchangeRate,
);

export const exchangeRoute = exRateRouter;
