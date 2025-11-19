# Straddle NerdCon Demo - Context & Guide

## Project Overview

This is the **Straddle NerdCon Demo**, a full-stack application designed to showcase Straddle's unified fintech platform. It demonstrates modern ACH payments, identity verification (KYC), and "paykeys" (cryptographically-linked tokens) through a retro-styled split-screen interface.

**Key Features:**

- **Unified Terminal:** A browser-based CLI for interacting with the demo.
- **Real-time Dashboard:** Visualizes customer verification, bank linking, and payment flows.
- **Live API Integration:** Connects to Straddle's Sandbox API (no mocking) using deterministic `sandbox_outcome` configurations.
- **Retro Aesthetic:** 8-bit/Cyberpunk visual style.

## Architecture

The project is a **TypeScript Monorepo** using npm workspaces.

- **Frontend (`web/`):**
  - **Framework:** React 18 + Vite.
  - **Styling:** Tailwind CSS + Custom Retro Theme.
  - **State:** Zustand (local state), EventSource (SSE for real-time server updates).
  - **Key Components:** `Terminal.tsx` (CLI), `CommandMenu.tsx`, Dashboard Cards (`CustomerCard`, `PaykeyCard`, `ChargeCard`).
- **Backend (`server/`):**
  - **Framework:** Node.js + Express.
  - **Integration:** `@straddlecom/straddle` SDK.
  - **Real-time:** Server-Sent Events (SSE) for pushing state changes to the frontend.
  - **Storage:** In-memory state management (resets on restart).

## Key Directories

- `/server`: Backend source code.
  - `src/routes/`: API endpoints (`customers`, `paykeys`, `charges`, `bridge`).
  - `src/domain/`: Business logic and state management.
- `/web`: Frontend source code.
  - `src/components/`: UI components.
  - `src/lib/`: Utility functions, command parsing, and API clients.
- `/docs`: Comprehensive project documentation, including test plans (`testing/`), feature plans (`plans/`), and reports.
- `/design`: Design system assets and reference components.

## Development Workflow

### Setup

1.  **Install Dependencies:** `npm install`
2.  **Environment:**
    - Copy `server/.env.example` to `server/.env`.
    - Set `STRADDLE_API_KEY` (Sandbox key).
    - Set `STRADDLE_ENV=sandbox`.

### Running the Project

- **Start All (Dev):** `npm run dev` (Starts server on :3001, web on :5173).
- **Server Only:** `npm run dev:server`
- **Web Only:** `npm run dev:web`

### Building & Testing

- **Build:** `npm run build`
- **Test (All):** `npm test`
- **Test (Server):** `npm test --workspace=server` (Jest)
- **Test (Web):** `npm test --workspace=web` (Vitest)
- **Lint:** `npm run lint`
- **Format:** `npm run format`

## Conventions & Standards

- **Code Style:** Enforced via ESLint and Prettier. Husky hooks run these on commit.
- **Type Safety:** Strict TypeScript usage. Avoid `any`.
- **API Usage:**
  - Always verify fields exist in the SDK types (`node_modules/@straddlecom/straddle/resources/*.d.ts`) before using them.
  - Access data via the `.data` property in SDK responses.
  - Use `paykeyResponse.data.paykey` (the token) for charges, not the ID.
- **Testing:**
  - Tests are required for new features.
  - Server tests use Jest; Web tests use Vitest.
  - Mock external API calls in tests.

## Terminal Commands (Demo Interface)

The web interface accepts commands like:

- `/demo`: Run full happy-path flow.
- `/customer-create`: Create a verified customer.
- `/create-paykey`: Link a bank account.
- `/create-charge`: Process a payment.
- `/help`: List all commands.

## Important Notes

- **Sensitive Data:** API keys go in `server/.env` ONLY. Never expose them to the client.
- **Documentation:** Refer to `CLAUDE.md` for detailed developer guides and `docs/` for historical context.
