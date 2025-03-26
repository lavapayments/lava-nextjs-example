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
  const chat = useChat({
    experimental_prepareRequestBody({ messages, id }) {
      return {
        messages,
        id,
        connectionId,
      };
    },
  });

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-indigo-950 p-6 text-white">
      <div className="container flex max-w-4xl flex-col items-center gap-10 px-4 py-12">
        <h1 className="text-center text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Lava{" "}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Payments
          </span>{" "}
          Demo
        </h1>

        <Card className="w-full max-w-xl border border-purple-300/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
          <h2 className="mb-6 text-2xl font-bold text-purple-100">
            Connect Your Wallet
          </h2>

          {connectionId ? (
            <div className="space-y-5">
              <div className="rounded-md bg-green-900/30 p-3">
                <p className="flex items-center text-green-300">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Wallet Connected
                </p>
              </div>

              <div className="rounded-md bg-purple-900/30 p-4">
                <p className="text-sm text-purple-200">
                  Connection ID:{" "}
                  <span className="font-mono">
                    {connectionId.substring(0, 12)}...
                  </span>
                </p>

                {connectionInfo?.balance !== undefined && (
                  <p className="mt-2 text-xl font-bold text-white">
                    Balance: ${connectionInfo.balance.toFixed(2)}
                  </p>
                )}
              </div>

              <Button
                onClick={handleTopUp}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Processing..." : "Add Funds"}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Processing..." : "Connect Wallet"}
            </Button>
          )}
        </Card>

        {!!connectionId && (
          <Card className="w-full max-w-xl border border-purple-300/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
            <h2 className="mb-6 text-2xl font-bold text-purple-100">
              AI Chat Demo
            </h2>

            <div className="mb-6 max-h-80 space-y-4 overflow-y-auto rounded-md bg-indigo-950/50 p-4">
              {chat.messages.length > 0 ? (
                chat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-purple-800/40 text-purple-100"
                        : "bg-indigo-800/40 text-indigo-100"
                    }`}
                  >
                    <span className="block text-xs font-semibold uppercase text-purple-300">
                      {message.role === "user" ? "You" : "AI"}
                    </span>
                    <span>{message.content}</span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-purple-300 opacity-70">
                  Your conversation will appear here
                </div>
              )}
            </div>

            <form onSubmit={chat.handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-purple-200"
                >
                  Enter your message:
                </label>
                <Input
                  id="prompt"
                  value={chat.input}
                  onChange={chat.handleInputChange}
                  placeholder="What would you like to know?"
                  className="w-full bg-white/20 py-6 text-white placeholder:text-purple-200/50 focus:border-purple-400 focus:ring-purple-400"
                  disabled={disabled}
                />
              </div>

              <Button
                type="submit"
                disabled={disabled || !chat.input.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {disabled ? "Processing..." : "Send"}
              </Button>
            </form>
          </Card>
        )}

        <div className="mt-8 text-center text-sm text-purple-200 opacity-80">
          <p>This is a demo implementation of Lava Payments integration.</p>
          <p className="mt-2">
            Check out the{" "}
            <a
              href="https://www.lavapayments.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-300 underline transition-colors hover:text-pink-200"
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
