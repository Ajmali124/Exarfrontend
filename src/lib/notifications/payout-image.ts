import { ImageResponse } from "@vercel/og";
import { PayoutCardOg } from "./payout-og";

export type RenderPayoutImageData = {
  name: string;
  amount: number;
  currency: string;
  withdrawalId: string;
  profileImage: string;
  logoUrl: string;
};

/**
 * Shared OG renderer. Returns ImageResponse so callers can return it (route) or
 * buffer it (IPN). Use @vercel/og so it can run in both route and serverless contexts.
 */
export function renderPayoutImage(data: RenderPayoutImageData) {
  return new ImageResponse(PayoutCardOg(data), { width: 600, height: 1067 });
}
