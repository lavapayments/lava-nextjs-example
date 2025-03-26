import { NextResponse } from "next/server";
import { env } from "~/env";
import { lava } from "~/server/clients/lava";

export async function POST() {
  try {
    const checkoutSession = await lava.checkout.create({
      checkout_mode: "onboarding",
      origin_url: env.LAVA_ORIGIN_URL,
    });

    return NextResponse.json({
      token: checkoutSession.checkout_session_token,
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
