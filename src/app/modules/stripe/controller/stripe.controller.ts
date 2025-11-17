import { Request, Response } from "express";
import { StripeWebhookService } from "../service/stripe-webhook.service";

export class WebhookController {
  private webhookService: StripeWebhookService;

  constructor() {
    this.webhookService = new StripeWebhookService();
    this.handleStripeWebhook = this.handleStripeWebhook.bind(this);
  }

  /**
   * Stripe webhook endpoint
   */
  public async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    // Stripe requires raw body for signature verification
    if (req.readable) {
      // Store the raw body if you're using body parser middleware
      const rawBody = (req as any).rawBody || req.body;
      req.body = rawBody;
    }

    await this.webhookService.handleWebhook(req, res);
  }

  /**
   * Webhook test endpoint (for development)
   */
  public async testWebhook(req: Request, res: Response): Promise<void> {
    try {
      // This is for testing webhook handling in development
      // You can simulate webhook events here
      res.json({ message: "Webhook test endpoint", success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
