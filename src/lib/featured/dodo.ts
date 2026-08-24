// ─────────────────────────────────────────────────────────────
// Featured Projects — Dodo Payments Integration
// ─────────────────────────────────────────────────────────────

import DodoPayments from "dodopayments";

// ── Client Initialization ────────────────────────────────────

function getDodoClient(): DodoPayments {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  const environment = process.env.DODO_PAYMENTS_ENVIRONMENT || "test_mode";

  if (!apiKey) {
    throw new Error(
      "Missing DODO_PAYMENTS_API_KEY. Configure it in your environment variables."
    );
  }

  return new DodoPayments({
    bearerToken: apiKey,
    ...(webhookKey ? { webhookKey } : {}),
    environment: environment as "test_mode" | "live_mode",
  });
}

// ── Checkout Session ─────────────────────────────────────────

export interface CheckoutSessionParams {
  amountCents: number;
  metadata: Record<string, string>;
  returnUrl: string;
}

export interface CheckoutSessionResult {
  checkout_url: string;
  session_id: string;
}

export async function createCheckoutSession(
  params: CheckoutSessionParams,
  productId?: string
): Promise<CheckoutSessionResult> {
  const client = getDodoClient();
  const finalProductId = productId || process.env.DODO_PAYMENTS_PRODUCT_ID;

  if (!finalProductId) {
    throw new Error(
      "Missing Product ID. Create a product in your Dodo Dashboard and set the ID in env."
    );
  }

  const session = await client.checkoutSessions.create({
    product_cart: [
      {
        product_id: finalProductId,
        quantity: 1,
      },
    ],
    return_url: params.returnUrl,
    metadata: params.metadata,
  });

  if (!session.checkout_url) {
    throw new Error("Failed to create checkout session — no checkout URL returned.");
  }

  return {
    checkout_url: session.checkout_url,
    session_id: session.session_id || "",
  };
}

// ── Webhook Verification ─────────────────────────────────────

export interface WebhookHeaders {
  "webhook-id": string;
  "webhook-signature": string;
  "webhook-timestamp": string;
}

export interface DodoWebhookEvent {
  business_id?: string;
  type: string;
  timestamp?: string;
  data: {
    payload_type?: string;
    payment_id?: string;
    metadata?: Record<string, string>;
    [key: string]: unknown;
  };
}

export function verifyAndParseWebhook(
  rawBody: string,
  headers: WebhookHeaders
): DodoWebhookEvent {
  const client = getDodoClient();

  // The SDK's unwrap method verifies the HMAC signature and parses the payload
  const event = client.webhooks.unwrap(rawBody, {
    headers: {
      "webhook-id": headers["webhook-id"],
      "webhook-signature": headers["webhook-signature"],
      "webhook-timestamp": headers["webhook-timestamp"],
    },
  }) as unknown as DodoWebhookEvent;

  return event;
}
