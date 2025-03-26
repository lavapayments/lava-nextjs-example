import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest, NextResponse } from "next/server";
import { type CoreMessage, generateText } from "ai";
import { lava } from "~/server/clients/lava";
import { env } from "~/env";

export async function POST(req: NextRequest) {
  try {
    const { messages, connectionSecret } = (await req.json()) as {
      messages: CoreMessage[];
      connectionSecret: string;
    };

    // Generate a forward token for this connection
    const forwardToken = lava.generateForwardToken({
      connection_secret: connectionSecret,
      product_secret: env.LAVA_PRODUCT_SECRET,
    });

    // Configure OpenAI with Lava as the proxy
    const openai = createOpenAI({
      baseURL: lava.openaiUrl,
      apiKey: forwardToken,
    });

    // Generate text using the AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process chat",
      },
      { status: 500 },
    );
  }
}
