# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **live demo application** for Fintech NerdCon showcasing Straddle's unified fintech platform. The demo features a split-screen web app with a CLI-style terminal interface and real-time dashboard showing customer identity verification, account connectivity, and payment processing.

**Critical Constraint**: All Straddle API calls MUST use the real sandbox API via the `@straddlecom/straddle` Node SDK. No mocking or fake responses - only `sandbox_outcome` for simulation.

## Architecture

**Monorepo Structure** (planned):
```
server/     # Node/Express/TypeScript backend with Straddle SDK
web/        # React/TypeScript/Vite frontend with retro gaming UI
design/     # Retro 8-bit gaming design system assets
```

**Data Flow**: Browser UI → Demo Server (Express) → Straddle Sandbox API

**Critical Security Rule**: API keys ONLY in server environment. Never in frontend code or VITE_ variables.

## Straddle SDK Integration

### Installation

```bash
npm install @straddlecom/straddle
```

### Client Initialization

```typescript
import Straddle from '@straddlecom/straddle';

const client = new Straddle({
  apiKey: process.env.STRADDLE_API_KEY,
  environment: 'sandbox' // or 'production'
});
```

### Key SDK Methods

**Charges**:
```typescript
const charge = await client.charges.create({
  amount: 10000, // cents
  paykey: 'paykey_id',
  currency: 'USD',
  consent_type: 'internet',
  device: { ip_address: '192.168.1.1' },
  payment_date: '2024-01-15',
  config: { balance_check: 'enabled', sandbox_outcome: 'paid' }
});

const chargeDetails = await client.charges.get('charge_id');
```

**Customers**:
```typescript
const customer = await client.customers.create({
  name: 'Alberta Bobbeth Charleson',
  type: 'individual',
  email: 'alberta@example.com',
  phone: '+12125550123',
  device: { ip_address: '192.168.1.1' },
  config: { sandbox_outcome: 'verified' }
});

const review = await client.customers.review.get('customer_id');
const decision = await client.customers.review.decision('customer_id', {
  status: 'verified'
});
```

**Bridge/Paykeys**:
```typescript
// Plaid path
const paykeyFromPlaid = await client.bridge.link.plaid({
  customer_id: 'customer_id',
  plaid_token: 'processor-sandbox-xxx'
});

// Bank account path
const paykeyFromBank = await client.bridge.link.bankAccount({
  customer_id: 'customer_id',
  account_number: '123456789',
  routing_number: '021000021',
  account_type: 'checking',
  config: { sandbox_outcome: 'active' }
});

const paykey = await client.paykeys.get('paykey_id');
```

### SDK Features

- **Type Safety**: Full TypeScript definitions
- **Auto-Pagination**: `for await (const item of client.payments.list()) { }`
- **Error Handling**: Structured error classes (BadRequestError, AuthenticationError, etc.)
- **Retries**: Automatic retry logic (2 retries by default)
- **Custom Requests**: `client.get()`, `client.post()` for undocumented endpoints

## API Reference

**Primary Resources**:
- **MCP Server**: https://docs.straddle.com/mcp
- **API Overview**: https://docs.straddle.com/llms.txt
- **Node SDK**: https://github.com/straddleio/straddle-node
- **Main Documentation**: https://docs.straddle.com/

**Key Documentation Pages**:
- Customers & Identity: https://docs.straddle.io/guides/identity/customers
- Paykeys: https://docs.straddle.io/guides/bridge/paykeys
- Payments: https://docs.straddle.io/guides/payments/overview
- Sandbox Testing: https://docs.straddle.io/guides/resources/sandbox-paybybank
- Webhooks: https://docs.straddle.io/webhooks/overview/events

## Development Setup

### Server (not yet implemented)
```bash
cd server
npm install
cp .env.example .env  # Add your STRADDLE_API_KEY
npm run dev           # Start on port 4000
```

Required environment variables:
- `STRADDLE_API_KEY` - Sandbox API key (required)
- `STRADDLE_ENV` - Default: `sandbox`
- `PLAID_PROCESSOR_TOKEN` - Optional for one-click demo

### Web (not yet implemented)
```bash
cd web
npm install
npm run dev  # Vite dev server
```

## Key Technical Decisions

### Backend Stack
- **Node.js** ≥ 18 with TypeScript
- **Express** for REST endpoints
- **@straddlecom/straddle** - Official SDK (MUST use this, note: @straddlecom not @straddleio)
- **uuid** - For Request-Id, Correlation-Id, Idempotency-Key headers
- **dotenv** - Environment configuration
- **SSE/WebSocket** - Real-time webhook updates to UI

### Frontend Stack
- **React + TypeScript + Vite**
- **shadcn/ui** with custom retro gaming theme
- **Tailwind CSS** with 8-bit aesthetic (neon colors, scanlines, CRT effects)
- **EventSource** - For SSE connection to server

### API Endpoints Structure

Demo server exposes thin wrappers around Straddle:

**Customers**:
- `POST /api/customers` → Create customer with identity verification
- `GET /api/customers/:id` → Get customer details
- `GET /api/customers/:id/review` → Get identity review details
- `PATCH /api/customers/:id/review` → Manual verification decision

**Bridge/Paykeys** (account linking):
- `POST /api/bridge/plaid` → Link via Plaid processor token
- `POST /api/bridge/bank-account` → Link via routing/account numbers
- `GET /api/paykeys/:id` → Get paykey status and balance

**Charges** (Pay by Bank):
- `POST /api/charges` → Create charge with sandbox_outcome
- `GET /api/charges/:id` → Get charge details with status history
- `GET /api/charges/:id/stream` → SSE for status updates

**State & Webhooks**:
- `GET /api/state` → Current demo state (customer/paykey/charge IDs)
- `GET /api/logs` → Recent API request log for UI display
- `POST /api/webhooks/straddle` → Receive Straddle webhooks
- `POST /api/reset` → Clear demo state

### Tracing & Headers

Every Straddle API call must include:
- `Request-Id` - UUID for individual request
- `Correlation-Id` - UUID for related requests
- `Idempotency-Key` - UUID for POST/PATCH operations (10-40 chars)

Implementation in `server/src/middleware/tracing.ts` should generate these and capture timing/status for the API request log.

### Sandbox Simulation

Use `config.sandbox_outcome` to control deterministic behavior:

**Customers**: `verified`, `review`, `rejected`
**Paykeys**: `active`, `inactive`, `rejected`
**Charges**: `paid`, `failed`, `reversed_insufficient_funds`, `on_hold_daily_limit`, `cancelled_for_fraud_risk`

Default test data template:
```typescript
{
  name: "Alberta Bobbeth Charleson",
  type: "individual",
  email: "alberta.charleson@example.com",
  phone: "+12125550123",
  device: { ip_address: "192.168.1.1" },
  config: { sandbox_outcome: "verified" }
}
```

## UI Layout

**Split Screen Design**:

**Left (40-45% width)**:
- Terminal component with CLI commands
- API request log showing real requests to Straddle

**Right (55-60% width)**:
- Customer Risk card (identity verification status)
- Paykey/Bank card (institution, ownership, balance)
- Charge card (amount, status, sandbox_outcome)
- Pizza Tracker (charge lifecycle: created → scheduled → pending → paid)

### Terminal Commands

- `/create-customer [--outcome <value>]`
- `/review-customer`
- `/verify-customer`
- `/create-paykey [plaid|bank] [--outcome <value>]`
- `/review-paykey`
- `/create-charge [--amount <cents>] [--outcome <value>]`
- `/track-charge`
- `/demo` - Full happy-path orchestration
- `/outcomes` - List supported sandbox outcomes
- `/info` - Show current state
- `/reset` - Clear demo state
- `/clear` - Clear terminal scrollback

## Working with Claude Code

### Development Approach

1. **Start with a plan**: Before coding, restate understanding and propose implementation phases. Wait for confirmation.

2. **Work incrementally**:
   - Phase 1: Server scaffold (config, SDK client, tracing middleware)
   - Phase 2: Core routes (customers, bridge, paykeys, charges)
   - Phase 3: Webhooks and SSE streaming
   - Phase 4: Frontend layout and terminal
   - Phase 5: Dashboard cards and pizza tracker

3. **Keep responsibilities separate**:
   - Server: All Straddle API calls, state management, webhooks
   - Frontend: UI only, calls `/api/*` endpoints
   - Never leak API keys to client

4. **No mocking**: Use real Straddle sandbox API. If env missing, fail with clear setup instructions.

5. **Use Straddle MCP if available**: Check for the Straddle MCP server (https://docs.straddle.com/mcp) which provides direct API access and can be used alongside the SDK for reference and testing.

6. **Ask when unclear**: If SDK methods are uncertain or UI details ambiguous, ask rather than assume.

7. **Optimize for live demo**:
   - Prefer simple, deterministic flows
   - Add minimal logging for debugging
   - Avoid complex dependencies that might fail on stage

### File Structure to Create

```
server/src/
  index.ts              # Express app entry
  config.ts             # Load env variables
  sdk.ts                # Straddle client factory
  middleware/
    tracing.ts          # Request-Id, Correlation-Id, Idempotency-Key
  domain/
    state.ts            # In-memory demo state
    sandbox.ts          # Sandbox outcome presets
    logs.ts             # Request/response log storage
    events.ts           # SSE broadcaster
  routes/
    customers.ts
    bridge.ts
    paykeys.ts
    charges.ts
    webhooks.ts
    logs.ts

web/src/
  main.tsx
  App.tsx
  layout/
    SplitView.tsx
  components/
    Terminal.tsx
    RequestLog.tsx
    dashboard/
      CustomerCard.tsx
      PaykeyCard.tsx
      ChargeCard.tsx
      PizzaTracker.tsx
  lib/
    api.ts              # HTTP client for server
    commands.ts         # Terminal command parser
    state.ts            # Local UI state
```

## Design System

The project uses a retro 8-bit gaming aesthetic inspired by Fintech NerdCon. Design assets are in `design/`:

- **retro-design-system.ts** - Design tokens and Tailwind config
- **retro-components.tsx** - Pre-built React components (RetroCard, RetroHeading, etc.)
- **retro-styles.css** - Global styles, animations (scanlines, CRT, glitch)

**Key Colors**:
- Primary: Cyan (#00FFFF) - Main neon accent
- Secondary: Blue (#0066FF) - Electric blue
- Accent: Magenta (#FF0099) - Hot pink
- Gold: (#FFC300) - Special highlights

**Effects**: Neon glow, pixel borders, scanlines, CRT distortion, glitch text, typewriter animation

## Reference Documentation

For detailed implementation guidance, see:
- `claude.md` - Original comprehensive spec
- `straddle-nerdcon-project-plan.md` - Architecture and sequence diagrams
- `design/README.md` - Design system usage examples

**Always reference**:
- Straddle MCP: https://docs.straddle.com/mcp
- API Overview: https://docs.straddle.com/llms.txt
- Node SDK: https://github.com/straddleio/straddle-node
