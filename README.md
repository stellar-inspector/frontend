# Stellar Inspector Frontend

A Next.js 15 web application that provides a dashboard interface for
inspecting Stellar accounts, transactions, and security analysis. It
proxies all requests through the companion Rust backend
([stellar-inspector/backend](https://github.com/stellar-inspector/backend))
which in turn queries the Stellar Horizon API.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture & Directory Structure](#architecture--directory-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Development](#development)
8. [Building for Production](#building-for-production)
9. [Pages & Routes](#pages--routes)
10. [API Route Handlers](#api-route-handlers)
11. [State Management](#state-management)
12. [Stellar SDK Integration](#stellar-sdk-integration)
13. [Styling](#styling)
14. [TypeScript Configuration](#typescript-configuration)
15. [Next.js Configuration](#nextjs-configuration)
16. [Linting](#linting)
17. [Environment Variables](#environment-variables)
18. [Production Deployment](#production-deployment)
19. [Troubleshooting](#troubleshooting)
20. [Contributing](#contributing)

---

## Project Overview

The Stellar Inspector frontend is a lightweight, server-rendered web UI
built with Next.js 15 and TypeScript. It presents a clean, dark-themed
dashboard that lets users:

- **Inspect accounts** -- enter a Stellar address to view balance,
  minimum reserve, available balance, sequence number, and transaction
  counts.
- **Inspect transactions** -- enter a transaction hash to view the
  ledger, source account, fee charged, operation count, timestamp, and
  success status.
- **Analyze fees** -- (via the backend) view fee-per-operation
  breakdowns and efficiency ratings.
- **View payment history** -- (via the backend) see sent/received
  totals for an account.
- **Run security checks** -- (via the backend) get a risk level,
  warnings, and checks-passed list for a transaction.

The UI is intentionally minimal -- two input forms backed by two server
actions -- so the heavy lifting happens in the backend. The frontend's
primary responsibility is to present Horizon-derived data in a readable
card format and handle error states gracefully.

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Next.js App Router | SSR/SEO-friendly, file-system routing, React Server Components |
| Server Actions / API Routes | API routes proxy to the backend; no direct Horizon calls from the browser |
| Zustand for state | Lightweight alternative to Redux; only API base-URL is stored globally |
| Tailwind CSS (utility classes) | Rapid UI iteration without leaving JSX |
| `use client` directive | Explicit opt-in to client components for interactive form pages |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.3 |
| Language | TypeScript | 5.x |
| Runtime | Node.js | 22+ |
| Package Manager | pnpm | 9+ |
| UI Library | React | 19 |
| HTTP Client | `fetch` (browser-native) | -- |
| State Management | Zustand | 5.0 |
| Stellar Integration | @stellar/stellar-sdk | 12.0 |
| Icons | lucide-react | 0.468 |
| Styling | Tailwind CSS (utility classes) | -- |
| Linting | ESLint (next/core-web-vitals) | -- |

---

## Architecture & Directory Structure

```
frontend/
├── .eslintrc.json          # ESLint config extending Next.js defaults
├── next.config.ts          # Next.js configuration (standalone output, server actions)
├── package.json            # Dependencies, scripts, metadata
├── tsconfig.json           # TypeScript compiler options
└── src/
    ├── app/
    │   ├── globals.css     # Global CSS (CSS custom properties, body styling)
    │   ├── layout.tsx      # Root layout with navigation bar
    │   ├── page.tsx        # Home page -- Account Inspector form
    │   ├── transaction/
    │   │   └── page.tsx    # Transaction Inspector form
    │   └── api/
    │       ├── account/
    │       │   └── [address]/
    │       │       └── route.ts   # Proxy: frontend -> backend /api/account/:address
    │       └── transaction/
    │           └── [tx_hash]/
    │               └── route.ts   # Proxy: frontend -> backend /api/transaction/:tx_hash
    └── lib/
        ├── stellar.ts      # Stellar SDK helpers (server instance, validators, formatters)
        └── store.ts        # Zustand store for API base URL
```

### Data Flow

```
Browser (React Client)
  |
  |  fetch('/api/account/:address')
  v
Next.js API Route (route.ts)
  |
  |  fetch(backendUrl + '/api/account/:address')
  v
Rust Backend (Axum)
  |
  |  Reqwest -> Horizon API (https://horizon.stellar.org)
  v
Horizon JSON Response
  -> Backend parses, analyzes, returns JSON
  -> Next.js API Route proxies JSON to frontend
  -> Frontend renders result card
```

The frontend never communicates with Horizon directly. All Horizon
requests go through the backend, which keeps Horizon API endpoints and
any future secrets off the client bundle.

---

## Prerequisites

- **Node.js** >= 22 (LTS)
- **pnpm** >= 9 -- install via `npm i -g pnpm`
- **Backend running** -- the frontend proxies API routes to
  `http://localhost:3000` by default. Start the backend first (see
  [backend README](https://github.com/stellar-inspector/backend)).

---

## Installation

```bash
# From the project root
pnpm install

# Or standalone
cd frontend
pnpm install
```

---

## Configuration

### next.config.ts

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
```

| Option | Purpose |
|---|---|
| `output: 'standalone'` | Enables lightweight Docker deployments with `next start` |
| `experimental.serverActions.bodySizeLimit` | Allows up to 2 MB request bodies for server actions |

> Note: Server Actions are enabled but not yet used directly; the
> `bodySizeLimit` setting is preparatory for future use.

---

## Development

```bash
# Start the dev server on port 3001
pnpm dev

# Or from project root:
pnpm dev:frontend
```

The Next.js dev server listens on `http://localhost:3001`.

### Development Workflow

1. Ensure the backend is running on `http://localhost:3000`.
2. Start the frontend with `pnpm dev`.
3. Open `http://localhost:3001` in a browser.
4. Enter a Stellar address or transaction hash in the respective forms.
5. Inspect the rendered result cards.

### Hot Reload

Next.js Fast Refresh is enabled by default. Changes to `.tsx` or `.ts`
files will hot-reload the browser without a full page refresh.

---

## Building for Production

```bash
pnpm build
pnpm start
```

The `next build` step compiles an optimized production build into
`.next/`. The `next start` command serves the built application.

### Docker (Standalone)

```Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
EXPOSE 3001
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t stellar-inspector-frontend .
docker run -p 3001:3001 \
  -e NEXT_PUBLIC_API_URL=http://backend:3000 \
  stellar-inspector-frontend
```

---

## Pages & Routes

### 1. Home Page (`/`) -- Account Inspector

**File:** `src/app/page.tsx`

- **Component type:** Client Component (`'use client'`)
- **Purpose:** Accepts a Stellar account address, fetches account data
  from the backend, and renders the results.

**Form fields:**

| Field | Type | Placeholder |
|---|---|---|
| Address | text | `GABC...XYZ` |

**Rendered result fields:**

| Field | Source |
|---|---|
| Address | `result.address` |
| XLM Balance | `result.xlm_balance` |
| Minimum Reserve | `result.minimum_reserve` |
| Available | `result.available` |
| Sequence | `result.sequence` |
| Transactions | `result.transactions` |

### 2. Transaction Page (`/transaction`) -- Transaction Inspector

**File:** `src/app/transaction/page.tsx`

- **Component type:** Client Component (`'use client'`)
- **Purpose:** Accepts a transaction hash, fetches transaction details
  from the backend, and renders the results.

**Form fields:**

| Field | Type | Placeholder |
|---|---|---|
| Hash | text | `Transaction hash` |

**Rendered result fields:**

| Field | Source |
|---|---|
| Hash | `result.hash` |
| Ledger | `result.ledger` |
| Created At | `result.created_at` |
| Source Account | `result.source_account` |
| Fee Charged | `result.fee_charged` (in stroops) |
| Operations | `result.operation_count` |

### 3. Root Layout (`/`)

**File:** `src/app/layout.tsx`

Provides the shared HTML shell for all pages:

- **Metadata:** title = "Stellar Inspector", description = "Inspect and
  analyze Stellar transactions"
- **Navigation bar:** dark-themed bar with links to "Account" (`/`) and
  "Transaction" (`/transaction`)
- **Main container:** centered max-width container with padding

---

## API Route Handlers

The frontend exposes two API route proxies that forward requests to the
backend. This avoids CORS issues and keeps the backend URL
configurable on the server side.

### GET `/api/account/[address]`

**File:** `src/app/api/account/[address]/route.ts`

**Parameters:**

| Name | Type | Location | Description |
|---|---|---|---|
| `address` | string | URL path | A Stellar account address (e.g., `GABC...XYZ`) |

**Request example:**

```
GET /api/account/GBZKTZHZ3K7K7J4ZJ5JZJZJZJZJZJZJZJZJZJZJZJZ
```

**Proxy target:**

```
GET {NEXT_PUBLIC_API_URL}/api/account/{address}
```

**Response:** JSON from the backend containing `address`,
`xlm_balance`, `minimum_reserve`, `available`, `sequence`,
`transactions`, and `payments` fields.

**Error responses:**

| Status | Error | Trigger |
|---|---|---|
| 500 | `Failed to connect to backend` | Backend is unreachable |
| * | * | Backend's own error (404, 502, etc.) is proxied through |

### GET `/api/transaction/[tx_hash]`

**File:** `src/app/api/transaction/[tx_hash]/route.ts`

**Parameters:**

| Name | Type | Location | Description |
|---|---|---|---|
| `tx_hash` | string | URL path | A Stellar transaction hash |

**Request example:**

```
GET /api/transaction/3a0ac8e9f0c5b5e5f3e3f3e3f3e3f3e3f3e3f3e3f3e3f3e3f3e3f3e3f3e3e
```

**Proxy target:**

```
GET {NEXT_PUBLIC_API_URL}/api/transaction/{tx_hash}
```

**Response:** JSON from the backend containing `hash`, `ledger`,
`created_at`, `source_account`, `fee_charged`, `operation_count`,
`successful`, `memo`, and `memo_type` fields.

**Error responses:** same pattern as the account route.

---

## State Management

**File:** `src/lib/store.ts`

The frontend uses [Zustand](https://github.com/pmndrs/zustand) for
minimal global state -- only the backend API base URL.

```ts
interface ApiState {
  baseUrl: string;
  setBaseUrl: (url: string) => void;
}

export const useApiStore = create<ApiState>((set) => ({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  setBaseUrl: (url) => set({ baseUrl: url }),
}));
```

| Property | Type | Default | Description |
|---|---|---|---|
| `baseUrl` | string | `http://localhost:3000` | Backend API base URL |
| `setBaseUrl` | function | -- | Updates `baseUrl` at runtime |

If `NEXT_PUBLIC_API_URL` is not set, the store defaults to
`http://localhost:3000`.

---

## Stellar SDK Integration

**File:** `src/lib/stellar.ts`

This module wraps the `@stellar/stellar-sdk` package with utility
functions:

### `getServer(network)`

```ts
import { Server } from '@stellar/stellar-sdk';

export function getServer(network: 'testnet' | 'mainnet' = 'testnet'): Server {
  const horizonUrl = network === 'mainnet'
    ? 'https://horizon.stellar.org'
    : 'https://horizon.stellar.org';

  return new Server(horizonUrl);
}
```

- Both `'mainnet'` and `'testnet'` currently resolve to
  `https://horizon.stellar.org`. The testnet URL should be updated to
  `https://horizon-testnet.stellar.org` in a future version.
- Returns a `Server` instance ready to make Horizon API calls.

### `isValidStellarAddress(address)`

```ts
export function isValidStellarAddress(address: string): boolean {
  if (!address || address.length < 56) return false;
  return address.startsWith('G') || address.startsWith('M') || address.startsWith('S');
}
```

| Prefix | Meaning |
|---|---|
| `G` | Standard public key (Ed25519) |
| `M` | Muxed account identifier |
| `S` | Secret seed (should not be entered in the UI) |

### `formatAmount(amount, decimals)`

```ts
export function formatAmount(amount: string, decimals = 7): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
}
```

Formats a numeric string to a fixed decimal places (default 7, matching
Stellar's native precision for XLM).

### `stroopsToXlm(stroops)`

```ts
export function stroopsToXlm(stroops: string): string {
  const s = parseFloat(stroops);
  if (isNaN(s)) return '0';
  return (s / 10_000_000).toFixed(7);
}
```

Converts stroops (the smallest unit of XLM, 1 XLM = 10,000,000 stroops)
to a human-readable XLM string.

---

## Styling

The frontend uses a **dark theme** with Tailwind CSS utility classes
applied inline. No external CSS framework is imported beyond the
global `globals.css`.

### globals.css

```css
:root {
  --background: #0f172a;   /* slate-950 */
  --foreground: #f8fafc;   /* slate-50  */
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: system-ui, -apple-system, sans-serif;
}
```

### Color palette

| Usage | Tailwind class | Hex |
|---|---|---|
| Background | `bg-gray-900` / `bg-gray-900/50` | `#111827` |
| Cards | `bg-gray-900` | `#111827` |
| Borders | `border-gray-800` | `#1f2937` |
| Text (primary) | `text-white` | `#ffffff` |
| Text (secondary) | `text-gray-300` / `text-gray-400` | `#d1d5db` / `#9ca3af` |
| Accent (buttons) | `bg-blue-600` / `hover:bg-blue-700` | `#2563eb` |
| Success | `text-green-400` | `#4ade80` |
| Error | `text-red-400` / `border-red-800` / `bg-red-900/20` | `#f87171` / `#7f1d1d` / rgba(127,29,29,0.2) |
| Navbar backdrop | `bg-gray-900/50 backdrop-blur` | rgba(17,24,39,0.5) |

---

## TypeScript Configuration

**File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

| Option | Value | Notes |
|---|---|---|
| `target` | `ES2017` | Matches Node.js 22 minimum |
| `strict` | `true` | Full strict mode enabled |
| `noEmit` | `true` | Next.js handles compilation |
| `jsx` | `preserve` | Next.js transforms JSX at build time |
| `paths` | `@/*` -> `./src/*` | Enables absolute imports from `@/` |
| `incremental` | `true` | Speeds up type checking on incremental builds |

---

## Linting

**File:** `.eslintrc.json`

```json
{
  "extends": "next/core-web-vitals"
}
```

Uses the official Next.js ESLint config with `core-web-vitals` ruleset.
Run linting with:

```bash
pnpm lint
```

---

## Environment Variables

| Variable | Prefix | Required | Default | Description |
|---|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_` | No | `http://localhost:3000` | Backend API base URL exposed to the browser |

The `NEXT_PUBLIC_` prefix means this variable is inlined at build time
and available client-side. Never put secrets here.

### Setting the variable

Create a `.env.local` file in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Or for production, set it in your deployment platform's environment
configuration.

---

## Production Deployment

### Vercel (Recommended)

1. Import the repository into [Vercel](https://vercel.com).
2. Set the following project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Environment Variable:** `NEXT_PUBLIC_API_URL` -> your backend URL
3. Deploy.

Vercel auto-detects Next.js and handles SSR, ISR, and image
optimization automatically.

### Docker

See the [Docker section](#docker-standalone) above for a multi-stage
Dockerfile that builds and serves the standalone output.

---

## Troubleshooting

### "Failed to connect to backend"

The backend is not running or `NEXT_PUBLIC_API_URL` is pointing to the
wrong address.

1. Start the backend: `cd backend && cargo run`
2. Verify `NEXT_PUBLIC_API_URL` matches the backend's listen address.
3. Check the browser's Network tab to see the failed request.

### API routes return 500

Ensure the backend is serving on the same port as
`NEXT_PUBLIC_API_URL`. The backend defaults to `0.0.0.0:3000`.

### CSS not loading

Ensure `globals.css` is imported in `layout.tsx`:

```tsx
import './globals.css';
```

### TypeScript errors after adding imports

Use the `@/*` path alias:

```ts
import { isValidStellarAddress } from '@/lib/stellar';
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/my-feature`.
3. Make changes and commit: `git commit -m "feat: add my feature"`.
4. Push: `git push origin feat/my-feature`.
5. Open a pull request.

### Code Style

- Use Prettier formatting (Next.js default).
- Follow the existing `use client` directive pattern for interactive
  pages.
- Use Tailwind utility classes for styling.
- Avoid `any` types -- use explicit TypeScript interfaces.
