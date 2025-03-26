import { NextResponse } from "next/server";
import { getConnectionDetails } from "~/server/lava";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> },
) {
  const resolvedParams = await params;
  const { connectionId } = resolvedParams;

  if (!connectionId) {
    return NextResponse.json(
      { error: "Connection ID is required" },
      { status: 400 },
    );
  }

  try {
    const connectionInfo = await getConnectionDetails(connectionId);

    if (!connectionInfo) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(connectionInfo);
  } catch (error) {
    console.error("Error fetching connection details:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection details" },
      { status: 500 },
    );
  }
}
