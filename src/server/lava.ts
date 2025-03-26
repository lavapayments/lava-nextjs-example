import { lava } from "~/server/clients/lava";

export async function getConnectionDetails(connectionId: string) {
  try {
    const connection = await lava.connections.retrieve(connectionId);

    return {
      connectionId,
      balance:
        typeof connection.wallet?.balance === "string"
          ? parseFloat(connection.wallet.balance)
          : connection.wallet?.balance,
      email: connection.wallet?.email,
    };
  } catch (error) {
    console.error("Error fetching connection details:", error);
    return null;
  }
}
