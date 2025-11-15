# Development Plan: Fintech NerdCon Demo

**Project**: Straddle unified fintech platform live demo
**Status**: Phase 1 - Monorepo Infrastructure Setup
**Last Updated**: 2025-11-13

---

## Phase 1: Monorepo Infrastructure Setup
**Goal**: Establish workspace structure, shared tooling, and development environment

### 1. Create monorepo structure
- [ ] Initialize `server/`, `web/`, and keep existing `design/` directory
- [ ] Set up root `package.json` with workspace configuration
- [ ] Configure TypeScript project references for type-safe cross-package imports

### 2. Backend scaffold (`server/`)
- [ ] Initialize Node.js/TypeScript project with Express
- [ ] Install Straddle SDK (`@straddlecom/straddle`), uuid, dotenv, cors
- [ ] Create `.env.example` and setup for `STRADDLE_API_KEY`
- [ ] Configure tsconfig.json with strict mode and ES2022 target

### 3. Frontend scaffold (`web/`)
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install Tailwind CSS with design system configuration
- [ ] Integrate existing retro design system from `/design/`
- [ ] Set up shadcn/ui with retro theme overrides

### 4. Shared tooling
- [ ] Configure ESLint and Prettier for consistent code style
- [ ] Add dev scripts: `npm run dev:server`, `npm run dev:web`, `npm run dev` (both)
- [ ] Set up TypeScript path aliases and build outputs

---

## Phase 2: Backend - Straddle SDK Integration & Data Capture
**Goal**: Connect to sandbox API and capture rich response data for UI display

### 5. SDK client setup (`server/src/sdk.ts`)
- [ ] Initialize Straddle client with environment-based configuration
- [ ] Add request tracing middleware (Request-Id, Correlation-Id, Idempotency-Key)
- [ ] Implement request/response logging to capture API data fields

### 6. Data models (`server/src/domain/`)
- [ ] Define TypeScript types for Customer, Paykey, Charge with **all relevant fields**
- [ ] Create state manager to track demo progression and API responses
- [ ] Build request log storage with timestamps, headers, status codes

### 7. Core API routes
- [ ] **POST `/api/customers`** - Create customer, capture identity verification fields (risk_score, verification_status, review_reasons)
- [ ] **GET `/api/customers/:id/review`** - Get identity review details
- [ ] **POST `/api/bridge/bank-account`** - Link account, capture ownership verification data
- [ ] **GET `/api/paykeys/:id`** - Get paykey with institution, balance, status, ownership fields
- [ ] **POST `/api/charges`** - Create charge with sandbox_outcome support
- [ ] **GET `/api/charges/:id`** - Get charge with full lifecycle status history

### 8. Real-time updates
- [ ] SSE endpoint `/api/events/stream` for webhook broadcasting
- [ ] Webhook receiver `POST /api/webhooks/straddle`
- [ ] In-memory event emitter to push updates to connected clients

---

## Phase 3: Frontend - Retro UI with Data Visualization
**Goal**: Build polished retro gaming interface that surfaces key API data

### 9. Split-screen layout
- [ ] Left panel (40%): Terminal + API request log
- [ ] Right panel (60%): Dashboard with live data cards
- [ ] Apply retro design system: scanlines, CRT effects, neon glow

### 10. Terminal component
- [ ] Command parser for `/create-customer`, `/create-paykey`, `/create-charge`, `/demo`
- [ ] Typewriter animation for responses
- [ ] Command history navigation (up/down arrows)
- [ ] Auto-scroll with manual scroll lock

### 11. API Request Log
- [ ] Display recent Straddle API calls with method, endpoint, status
- [ ] Show Request-Id, Correlation-Id headers
- [ ] Timing information (response time)
- [ ] Color-coded by status (2xx green, 4xx yellow, 5xx red)

### 12. Dashboard cards (using RetroCard from design system)
- [ ] **Customer Risk Card**: Show identity verification status, risk_score, verification method, review_reasons (if any)
- [ ] **Paykey/Bank Card**: Institution name, account ownership status, available balance, account_type, paykey status
- [ ] **Charge Card**: Amount, currency, current status, sandbox_outcome used, created/scheduled/completed timestamps
- [ ] **Pizza Tracker**: Visual lifecycle (created → scheduled → pending → processing → paid/failed)

### 13. Data field focus areas (we'll refine these as we go)
- Customer: `verification_status`, `risk_score`, `review.decision`, `identity.confidence`
- Paykey: `status`, `institution.name`, `ownership_verified`, `balance.available`, `linked_at`
- Charge: `status`, `amount`, `payment_date`, `status_history[]`, `failure_reason` (if any)

---

## Phase 4: Integration & Polish

### 14. Connect frontend to backend
- [ ] API client with fetch wrappers for all endpoints
- [ ] EventSource connection for SSE real-time updates
- [ ] Zustand store for managing customer/paykey/charge state

### 15. Demo orchestration
- [ ] `/demo` command that runs full happy path:
  1. Create verified customer
  2. Link bank account (create paykey)
  3. Create and track charge
- [ ] Animate state transitions with neon highlights
- [ ] Show API data flowing in real-time

### 16. Visual polish
- [ ] Add glitch effects on state transitions
- [ ] Neon pulse on data updates
- [ ] Retro sound effects (optional, if time permits)
- [ ] Responsive design for presentation mode

### 17. Error handling & edge cases
- [ ] Display API errors in terminal with helpful messages
- [ ] Handle sandbox outcome variations (`review`, `rejected`, `failed`, etc.)
- [ ] Graceful degradation if API key missing

---

## Key Principles

✨ **UI/UX First**: Every component uses retro design system with neon aesthetic
📊 **Data Transparency**: Surface meaningful API fields that show Straddle's value (identity linking, real-time status, fraud signals)
🎮 **Live Demo Ready**: Focus on reliability and visual impact for NerdCon presentation
🔗 **Real API Integration**: Use Straddle sandbox with `sandbox_outcome` for deterministic demos (NO mocking)

---

## Critical Reminders

- ✅ **Real Straddle sandbox API calls** via `@straddlecom/straddle` SDK
- ✅ **`sandbox_outcome`** parameter to simulate scenarios (verified/rejected, active/inactive, paid/failed)
- ❌ **No mocking** - all data comes from actual Straddle API responses
- 🔐 **API keys server-only** - never expose in frontend or VITE_ variables
- 📝 **Request tracing** - Every call needs Request-Id, Correlation-Id, Idempotency-Key headers

---

## Session Context

**Straddle Value Prop**: ACH runs on 1970s infrastructure with systematic delays, zero visibility, and too much fraud. Straddle brought the card network model to A2A with cryptographically-linked tokens ("paykeys") that marry identity to open banking, delivering instant rail speed with card-level reliability.

**Demo Focus**: Show instant visibility, identity-linked payments, and fraud prevention vs. legacy ACH delays.
