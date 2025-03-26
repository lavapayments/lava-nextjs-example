import { createOpenAI } from "@ai-sdk/openai";
import { type NextRequest, NextResponse } from "next/server";
import { type CoreMessage, streamText } from "ai";
import { lava } from "~/server/clients/lava";
import { env } from "~/env";

export async function POST(req: NextRequest) {
  try {
    const { messages, connectionId } = (await req.json()) as {
      messages: CoreMessage[];
      connectionId: string;
    };

    const connection = await lava.connections.retrieve(connectionId);

    // Generate a forward token for this connection
    const forwardToken = lava.generateForwardToken({
      connection_secret: connection.connection_secret,
      product_secret: env.LAVA_PRODUCT_SECRET,
    });

    // Configure OpenAI with Lava as the proxy
    const openai = createOpenAI({
      baseURL: lava.openaiUrl,
      apiKey: forwardToken,
    });

    // Generate text using the AI SDK
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages,
    });

    // consume the stream to ensure it runs to completion & triggers onFinish
    // even when the client response is aborted:
    void result.consumeStream();

    return result.toDataStreamResponse();
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
