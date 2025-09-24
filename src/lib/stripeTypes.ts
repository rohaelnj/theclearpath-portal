export type StripeEnv = {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  NEXT_PUBLIC_BASE_URL?: string;
};

export type CheckoutSessionRequest = {
  bookingId: string;
  amountAED: number;
  currency?: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutSessionResponse = {
  id: string;
  url: string | null;
};

export type BookingMetadata = {
  bookingId: string;
  slotId?: string;
  clientId?: string;
  therapistId?: string;
};
