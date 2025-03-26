"use client";

import { useState } from "react";
import { useLavaCheckout } from "@lavapayments/checkout";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { useChat } from "@ai-sdk/react";

type ConnectionInfo = {
  connectionId: string;
  balance: number;
  email: string;
};

export default function HomePage() {
  // Connection state
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  // Chat state
  const chat = useChat({});

  // Lava checkout hook
  async function saveConnection(connectionId: string) {
    setConnectionId(connectionId);
    // Fetch connection details
    setLoading(true);
    try {
      const response = await fetch(`/api/connections/${connectionId}`);
      if (response.ok) {
        const data = (await response.json()) as ConnectionInfo;
        setConnectionInfo(data);
      }
    } catch (error) {
      console.error("Error fetching connection details:", error);
    } finally {
      setLoading(false);
    }
  }
  const { open } = useLavaCheckout({
    onSuccess: ({ connectionId: newConnectionId }) => {
      console.log("Checkout successful!");
      void saveConnection(newConnectionId);
    },
    onCancel: ({ checkoutSessionId }) => {
      console.log("Checkout cancelled:", checkoutSessionId);
    },
  });

  // Handle checkout button click
  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
      });

      if (response.ok) {
        const data = (await response.json()) as {
          token: string;
        };
        open(data.token);
      } else {
        console.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle top-up button click
  const handleTopUp = async () => {
    if (!connectionId) return;

    setLoading(true);
    try {
      const response = await fetch("/api/create-topup-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          token: string;
        };
        open(data.token);
      } else {
        console.error("Failed to create top-up session");
      }
    } catch (error) {
      console.error("Error creating top-up session:", error);
    } finally {
      setLoading(false);
    }
  };
  const disabled =
    loading || (chat.status !== "ready" && chat.status !== "error");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] p-4 text-white">
      <div className="container flex max-w-4xl flex-col items-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Lava <span className="text-[hsl(280,100%,70%)]">Payments</span> Demo
        </h1>

        <Card className="w-full max-w-xl bg-white/10 p-6">
          <h2 className="mb-4 text-2xl font-bold">Connect Your Wallet</h2>

          {connectionId ? (
            <div className="space-y-4">
              <p className="text-green-400">✅ Wallet Connected</p>
              <p>Connection ID: {connectionId.substring(0, 12)}...</p>

              {connectionInfo?.balance !== undefined && (
                <p>Balance: ${connectionInfo.balance.toFixed(2)}</p>
              )}

              <Button onClick={handleTopUp} disabled={loading}>
                {loading ? "Loading..." : "Add Funds"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Loading..." : "Connect Wallet"}
            </Button>
          )}
        </Card>

        {!!connectionId && (
          <Card className="w-full max-w-xl bg-white/10 p-6">
            <h2 className="mb-4 text-2xl font-bold">AI Chat Demo</h2>
            {chat.messages.map((message) => (
              <div key={message.id}>
                {message.role === "user" ? "User: " : "AI: "}
                {message.content}
              </div>
            ))}

            <form onSubmit={chat.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prompt" className="block">
                  Enter your message:
                </label>
                <Input
                  id="prompt"
                  value={chat.input}
                  onChange={chat.handleInputChange}
                  placeholder="What would you like to know?"
                  className="w-full bg-white/20 text-white"
                  disabled={disabled}
                />
              </div>

              <Button
                type="submit"
                disabled={disabled || !chat.input.trim()}
                className="w-full"
              >
                {disabled ? "Processing..." : "Send"}
              </Button>
            </form>
          </Card>
        )}

        <div className="mt-8 text-center text-sm opacity-80">
          <p>This is a demo implementation of Lava Payments integration.</p>
          <p>
            Check out the{" "}
            <a
              href="https://docs.lavapayments.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              documentation
            </a>{" "}
            for more details.
          </p>
        </div>
      </div>
    </main>
  );
}
