# Lava Payments Next.js Example

This example demonstrates how to integrate Lava Payments into a Next.js application. It shows the implementation of:

1. Connecting a user's wallet using the Lava Checkout component
2. Making AI API requests through Lava's forward API
3. Checking wallet balances and topping up funds

## Getting Started

### Prerequisites

- Node.js 18 or later
- NPM or Yarn
- A Lava account with API keys

### Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Copy the `.env.example` file to `.env` and update with your Lava API keys:

```bash
cp .env.example .env
```

Edit the `.env` file to include your Lava API keys:

```
LAVA_SECRET_KEY="your_lava_secret_key"
LAVA_ORIGIN_URL="your_application_url" # The origin URL of your application (e.g., http://localhost:3000 for development or https://yourdomain.com for production)
LAVA_PRODUCT_SECRET="your_lava_product_secret"
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- **Wallet Connection**: Users can connect their Lava wallet to your application.
- **AI Chat**: Once connected, users can interact with an AI chatbot, with the requests proxied through Lava for usage-based billing.
- **Balance Display**: View the current wallet balance.
- **Top-up Functionality**: Add funds to the wallet balance.

## How It Works

1. **Connection**: When a user clicks "Connect Wallet", the Lava checkout flow is initiated, allowing them to create or connect their wallet.
2. **Chat Interface**: After connection, users can send messages which are processed by the AI API through Lava's forward endpoint.
3. **Billing**: Lava automatically tracks usage and bills the user based on API consumption.

## Documentation

For more information on the Lava API and SDK, refer to the [Lava Documentation](https://www.lavapayments.com).

## License

This example is licensed under the MIT License.
