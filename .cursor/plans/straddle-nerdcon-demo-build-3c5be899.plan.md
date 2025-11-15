<!-- 3c5be899-dfde-44c6-9466-07aebd17762e aeacfa84-5207-4995-b249-2ba3d77e8ba8 -->
# Straddle NerdCon Demo - Implementation Plan

## Project Overview

Build a live demo application for FintechNerdCon that showcases Straddle's unified fintech platform. The application features a split-screen UI with a CLI terminal on the left and dashboard cards on the right, all connected to real Straddle sandbox APIs.

## Architecture Summary

- **Backend**: Express + TypeScript server using `@straddleio/straddle` SDK
- **Frontend**: React + TypeScript + Vite with retro gaming design system
- **Communication**: REST API + SSE for webhook streaming
- **Key Constraint**: All Straddle calls must go through backend; no API keys in frontend

## Phase 1: Project Bootstrap & Backend Foundation

### 1.1 Initialize Monorepo Structure

- Create `server/` and `web/` directories
- Set up root `package.json` with workspace configuration
- Initialize TypeScript configs for both projects
- Create `.gitignore` and `.env.example` files

### 1.2 Backend Setup

**Files to create:**

- `server/package.json` with dependencies: `express`, `@straddleio/straddle`, `dotenv`, `uuid`, `cors`, `body-parser`
- `server/tsconfig.json` with Node.js target
- `server/src/index.ts` - Express app entry point
- `server/src/config.ts` - Environment variable loading and validation
- `server/.env.example` - Template with `STRADDLE_API_KEY`, `STRADDLE_ENV`, `PLAID_PROCESSOR_TOKEN`

**Key implementation:**

- Load and validate `STRADDLE_API_KEY` on startup
- Fail gracefully with clear error messages if env vars missing
- Set up Express with CORS, JSON parsing, error handling middleware

### 1.3 Straddle SDK Integration

**Files to create:**

- `server/src/sdk.ts` - Straddle client wrapper
- `server/src/middleware/tracing.ts` - Request-Id, Correlation-Id, Idempotency-Key generation

**Key implementation:**

- Create single Straddle client instance using `@straddleio/straddle`
- Implement helper functions: `createCustomer`, `getCustomer`, `getCustomerReview`, `patchCustomerReview`, `bridgePlaidToken`, `bridgeBankAccount`, `getPaykey`, `createCharge`, `getCharge`
- Generate tracing headers for all Straddle API calls
- Capture request timing and status for logging

### 1.4 Demo State Management

**Files to create:**

- `server/src/domain/state.ts` - In-memory demo state
- `server/src/domain/logs.ts` - Request/response logging
- `server/src/domain/sandbox.ts` - Sandbox outcome presets

**Key implementation:**

- Store `customerId`, `paykeyId`, `chargeId` in memory
- Maintain event log array for webhook events
- Implement request log capture (method, path, status, latency, headers)
- Define default sandbox configs (customer, charge outcomes)

## Phase 2: Backend API Routes

### 2.1 Customer Routes

**Files to create:**

- `server/src/routes/customers.ts`

**Endpoints:**

- `POST /api/customers` - Create customer with sandbox defaults
- `GET /api/customers/:id` - Get customer details
- `GET /api/customers/:id/review` - Get customer review/risk info
- `PATCH /api/customers/:id/review` - Update customer decision (verified/rejected)

**Implementation notes:**

- Use default customer template from `sandbox.ts`
- Store `customerId` in state after creation
- Return tracing headers in response
- Handle Straddle SDK errors gracefully

### 2.2 Bridge & Paykey Routes

**Files to create:**

- `server/src/routes/bridge.ts`
- `server/src/routes/paykeys.ts`

**Endpoints:**

- `POST /api/bridge/plaid` - Create paykey from Plaid token
- `POST /api/bridge/bank-account` - Create paykey from routing/account
- `GET /api/paykeys/:id` - Get paykey status and details

**Implementation notes:**

- Support `PLAID_PROCESSOR_TOKEN` from env or request body
- Accept sandbox outcome in request body
- Store `paykeyId` in state after creation

### 2.3 Charge Routes

**Files to create:**

- `server/src/routes/charges.ts`

**Endpoints:**

- `POST /api/charges` - Create charge with sandbox outcome
- `GET /api/charges/:id` - Get charge status and history

**Implementation notes:**

- Default amount: $50 (5000 cents)
- Support `sandbox_outcome` parameter (paid, reversed_insufficient_funds, on_hold_daily_limit, etc.)
- Include `balance_check: "enabled"` in config
- Store `chargeId` in state after creation

### 2.4 Webhook & Streaming Routes

**Files to create:**

- `server/src/routes/webhooks.ts`
- `server/src/domain/events.ts` - SSE event broadcaster

**Endpoints:**

- `POST /api/webhooks/straddle` - Receive Straddle webhook events
- `GET /api/charges/:id/stream` - SSE stream for charge status updates

**Implementation notes:**

- Parse webhook events (`charge.created.v1`, `charge.event.v1`)
- Store events in state
- Broadcast to connected SSE clients
- Handle client disconnect cleanup

### 2.5 Utility Routes

**Files to create:**

- `server/src/routes/logs.ts`
- `server/src/routes/state.ts`

**Endpoints:**

- `GET /api/logs` - Return recent API request logs
- `GET /api/state` - Return current demo state (IDs + last known objects)
- `POST /api/reset` - Clear demo state (optional)

**Implementation notes:**

- Return last 50 request logs with timing/headers
- Include customer, paykey, charge objects in state response
- Support state reset for fresh demo runs

### 2.6 Wire Routes to Express App

**Update:**

- `server/src/index.ts` - Register all route handlers
- Add error handling middleware
- Start server on port 4000 (or from env)

## Phase 3: Frontend Bootstrap

### 3.1 Frontend Project Setup

**Files to create:**

- `web/package.json` with dependencies: `react`, `react-dom`, `vite`, `typescript`, `tailwindcss`, `@radix-ui/*` (for shadcn), `zustand` (or React Query)
- `web/vite.config.ts` - Vite configuration
- `web/tsconfig.json` - TypeScript config for React
- `web/tailwind.config.ts` - Tailwind config integrating retro design system
- `web/.env.example` - `VITE_SERVER_BASE_URL=http://localhost:4000`

**Key setup:**

- Configure Tailwind to use retro design system from `design/retro-design-system.ts`
- Import retro styles from `design/retro-styles.css`
- Set up path aliases (`@/components`, `@/lib`)

### 3.2 Integrate Retro Design System

**Files to copy/adapt:**

- Copy `design/retro-components.tsx` → `web/src/components/ui/retro-components.tsx`
- Copy `design/retro-design-system.ts` → `web/src/lib/design-system/retro-design-system.ts`
- Copy `design/retro-styles.css` → `web/src/styles/retro-styles.css`

**Update:**

- Ensure `cn` utility function exists (`web/src/lib/utils.ts`)
- Verify retro components work with shadcn/ui base
- Test retro card, button, heading components

### 3.3 Core Frontend Infrastructure

**Files to create:**

- `web/src/lib/api.ts` - HTTP client for server API calls
- `web/src/lib/state.ts` - Frontend state management (Zustand store)
- `web/src/lib/commands.ts` - Command parser and executor

**Key implementation:**

- API client with base URL from env
- State store for `customerId`, `paykeyId`, `chargeId`, and fetched objects
- Command parser supporting flags (`--outcome`, `--amount`)

## Phase 4: Frontend UI Components

### 4.1 Layout Components

**Files to create:**

- `web/src/layout/SplitView.tsx` - Split-screen layout (40% left, 60% right)
- `web/src/App.tsx` - Main app component with SplitView

**Implementation:**

- Responsive grid layout
- Left column: Terminal + RequestLog
- Right column: Dashboard cards + PizzaTracker

### 4.2 Terminal Component

**Files to create:**

- `web/src/components/Terminal.tsx`

**Features:**

- Text input with command prompt (`>`)
- Scrollback area showing command history and responses
- Command parsing (leading `/` commands)
- Integration with `lib/commands.ts`
- Support commands: `/help`, `/info`, `/create-customer`, `/review-customer`, `/verify-customer`, `/create-paykey`, `/review-paykey`, `/create-charge`, `/track-charge`, `/demo`, `/outcomes`, `/reset`, `/clear`

**Implementation:**

- Maintain command history array
- Display formatted responses (IDs, statuses)
- Handle async command execution
- Show loading states

### 4.3 Request Log Component

**Files to create:**

- `web/src/components/RequestLog.tsx`

**Features:**

- Poll `GET /api/logs` or subscribe via SSE
- Display table: Time, Method/Path, Straddle Endpoint, Status, Latency, Tracing Headers
- Collapsible JSON for request/response details
- Auto-scroll to latest entries

**Implementation:**

- Refresh every 2 seconds or use SSE
- Format tracing headers nicely
- Color-code status codes (2xx green, 4xx yellow, 5xx red)

### 4.4 Dashboard Cards

**Files to create:**

- `web/src/components/dashboard/CustomerCard.tsx`
- `web/src/components/dashboard/PaykeyCard.tsx`
- `web/src/components/dashboard/ChargeCard.tsx`

**CustomerCard features:**

- Display name, email, phone, status
- Show identity verification summary from review endpoint
- "Verify anyway" button if status is `review`
- Fetch on `customerId` change

**PaykeyCard features:**

- Display institution name, masked account (last 4)
- Show status (`pending`, `active`, etc.)
- Display status_details and risk info
- Show balance if available

**ChargeCard features:**

- Display amount (formatted), currency, payment_rail
- Show status and status_details
- Display `customer_details` and `paykey_details` inline
- Show `config.balance_check` and `sandbox_outcome`

**Implementation:**

- Use RetroCard components from design system
- Fetch data when IDs change
- Handle loading and error states

### 4.5 Pizza Tracker Component

**Files to create:**

- `web/src/components/dashboard/PizzaTracker.tsx`

**Features:**

- Horizontal stepper showing charge lifecycle
- Statuses: `created` → `scheduled` → `pending` → `paid` (or failure paths)
- Subscribe to `GET /api/charges/:id/stream` via EventSource
- Highlight current step
- Show timestamps for completed steps
- Handle failure paths (`failed`, `reversed`, `on_hold`, `cancelled`)

**Implementation:**

- Use status_history from charge object
- Update on SSE events
- Animate transitions between states
- Use retro design system for visual styling

## Phase 5: Integration & Command Implementation

### 5.1 Command Implementation

**Update:**

- `web/src/lib/commands.ts` - Implement all command handlers

**Commands to implement:**

- `/help` - List all commands with usage
- `/info` - Call `/api/state`, display current IDs
- `/create-customer [--outcome <value>]` - POST `/api/customers`
- `/review-customer` - GET `/api/customers/:id/review`
- `/verify-customer` - PATCH `/api/customers/:id/review`
- `/create-paykey [plaid|bank] [--outcome <value>]` - POST `/api/bridge/plaid` or `/api/bridge/bank-account`
- `/review-paykey` - GET `/api/paykeys/:id`
- `/create-charge [--amount <cents>] [--outcome <value>]` - POST `/api/charges`
- `/track-charge` - Open SSE stream, update PizzaTracker
- `/demo` - Orchestrate happy path (customer → paykey → charge)
- `/outcomes` - Print supported sandbox outcomes
- `/reset` - POST `/api/reset`, clear UI state
- `/clear` - Clear terminal scrollback only

**Implementation:**

- Each command calls appropriate API endpoint
- Format responses for terminal display
- Update frontend state after successful commands
- Handle errors gracefully with user-friendly messages

### 5.2 State Synchronization

**Update:**

- `web/src/App.tsx` - On mount: call `/api/state` to hydrate dashboard
- Connect to `/api/charges/:id/stream` if `chargeId` exists
- Update cards when state changes

**Implementation:**

- Fetch initial state on app load
- Subscribe to SSE stream for active charge
- Update Zustand store on state changes
- Trigger card re-fetches when IDs change

## Phase 6: Testing & Verification

### 6.1 Backend Testing

- Test all routes with real Straddle sandbox API key
- Verify tracing headers are generated correctly
- Test webhook endpoint with sample Straddle webhook payload
- Verify SSE stream works and broadcasts events
- Test error handling (missing API key, invalid requests)

### 6.2 Frontend Testing

- Test all terminal commands end-to-end
- Verify dashboard cards update correctly
- Test PizzaTracker with different sandbox outcomes
- Verify request log displays correctly
- Test `/demo` command completes full flow

### 6.3 Integration Testing

- Run full demo flow: `/create-customer → /create-paykey → /create-charge --outcome paid`
- Verify webhooks trigger and PizzaTracker updates
- Test different sandbox outcomes
- Verify all tracing headers appear in request log
- Test state persistence across page refresh

### 6.4 Documentation

**Files to create:**

- `README.md` - Setup instructions, running the demo, environment variables
- Document how to get Straddle sandbox API key
- Document supported sandbox outcomes
- Include troubleshooting section

## Phase 7: Polish & Demo Readiness

### 7.1 Error Handling

- Add user-friendly error messages throughout
- Handle network failures gracefully
- Show loading states for all async operations
- Add retry logic for failed API calls

### 7.2 UI Polish

- Ensure retro design system is consistently applied
- Add animations for state transitions
- Polish terminal command output formatting
- Ensure responsive layout works on demo screen

### 7.3 Performance

- Optimize API polling intervals
- Debounce terminal input if needed
- Ensure SSE connections are properly cleaned up
- Test with multiple rapid commands

### 7.4 Demo Script Preparation

- Document demo flow and talking points
- Test all demo scenarios
- Prepare fallback options if something fails
- Create quick reference card for commands

## Key Files Reference

**Backend:**

- `server/src/index.ts` - Express app entry
- `server/src/config.ts` - Environment config
- `server/src/sdk.ts` - Straddle client wrapper
- `server/src/middleware/tracing.ts` - Tracing headers
- `server/src/domain/state.ts` - Demo state
- `server/src/domain/logs.ts` - Request logging
- `server/src/domain/sandbox.ts` - Sandbox presets
- `server/src/routes/*.ts` - All API routes

**Frontend:**

- `web/src/App.tsx` - Main app component
- `web/src/layout/SplitView.tsx` - Layout
- `web/src/components/Terminal.tsx` - Terminal UI
- `web/src/components/RequestLog.tsx` - API log
- `web/src/components/dashboard/*.tsx` - Dashboard cards
- `web/src/lib/api.ts` - API client
- `web/src/lib/commands.ts` - Command handlers
- `web/src/lib/state.ts` - Frontend state

**Design System:**

- `design/retro-components.tsx` - Retro UI components
- `design/retro-design-system.ts` - Design tokens
- `design/retro-styles.css` - Global styles

### To-dos

- [ ] Initialize monorepo structure with server/ and web/ directories, root package.json, TypeScript configs, and .env.example files
- [ ] Set up Express server with TypeScript, install dependencies (@straddleio/straddle, express, dotenv, uuid, cors), create config.ts for env loading
- [ ] Create sdk.ts with Straddle client wrapper and helper functions, implement tracing.ts middleware for Request-Id/Correlation-Id/Idempotency-Key
- [ ] Create domain/state.ts for in-memory state, domain/logs.ts for request logging, domain/sandbox.ts for sandbox presets
- [ ] Implement routes/customers.ts with POST /api/customers, GET /api/customers/:id, GET /api/customers/:id/review, PATCH /api/customers/:id/review
- [ ] Implement routes/bridge.ts and routes/paykeys.ts with POST /api/bridge/plaid, POST /api/bridge/bank-account, GET /api/paykeys/:id
- [ ] Implement routes/charges.ts with POST /api/charges and GET /api/charges/:id, support sandbox_outcome parameter
- [ ] Implement routes/webhooks.ts and domain/events.ts for POST /api/webhooks/straddle and GET /api/charges/:id/stream (SSE)
- [ ] Implement routes/logs.ts and routes/state.ts with GET /api/logs, GET /api/state, and optional POST /api/reset
- [ ] Update server/src/index.ts to register all routes, add error handling middleware, start server on port 4000
- [ ] Initialize web/ with Vite, React, TypeScript, Tailwind, install dependencies, configure Tailwind with retro design system
- [ ] Copy retro-components.tsx, retro-design-system.ts, retro-styles.css to web/src, ensure cn utility exists, verify components work
- [ ] Create lib/api.ts for HTTP client, lib/state.ts for Zustand store, lib/commands.ts for command parser
- [ ] Create layout/SplitView.tsx for split-screen layout and update App.tsx with SplitView structure
- [ ] Create components/Terminal.tsx with command input, scrollback area, command parsing, integration with lib/commands.ts
- [ ] Create components/RequestLog.tsx that polls GET /api/logs, displays request table with timing/headers, collapsible JSON details
- [ ] Create components/dashboard/CustomerCard.tsx, PaykeyCard.tsx, ChargeCard.tsx with RetroCard styling, fetch on ID changes
- [ ] Create components/dashboard/PizzaTracker.tsx with horizontal stepper, EventSource subscription, status transitions, retro styling
- [ ] Implement all commands in lib/commands.ts: /help, /info, /create-customer, /review-customer, /verify-customer, /create-paykey, /review-paykey, /create-charge, /track-charge, /demo, /outcomes, /reset, /clear
- [ ] Update App.tsx to fetch /api/state on mount, connect to SSE stream, update Zustand store, trigger card re-fetches
- [ ] Test all routes with real Straddle sandbox, verify tracing headers, test webhooks/SSE, test all commands end-to-end, verify PizzaTracker updates
- [ ] Create README.md with setup instructions, environment variables, supported sandbox outcomes, troubleshooting
- [ ] Add error handling, UI polish, performance optimizations, create demo script with talking points and fallback options