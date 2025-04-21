import { NextResponse } from "next/server";
import { env } from "~/env";
import { safeParseJsonObject } from "~/lib/json";
import { lava } from "~/server/clients/lava";

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const json = safeParseJsonObject(text);
    if (!json) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }
    const { connectionId } = json;

    if (!connectionId || typeof connectionId !== "string") {
      return NextResponse.json(
        { error: "Connection ID is required" },
        { status: 400 },
      );
    }

    const checkoutSession = await lava.checkoutSessions.create({
      checkout_mode: "topup",
      connection_id: connectionId,
      origin_url: env.LAVA_ORIGIN_URL,
    });

    return NextResponse.json({
      token: checkoutSession.checkout_session_token,
    });
  } catch (error) {
    console.error("Failed to create top-up session:", error);
    return NextResponse.json(
      { error: "Failed to create top-up session" },
      { status: 500 },
    );
  }
}
