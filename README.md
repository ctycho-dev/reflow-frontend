# Reflow Frontend

Next.js frontend for [Reflow](../reflow) — an on-chain activity campaign platform
on Base Sepolia. Users enroll in campaigns (SIWE), qualify by moving tokens
through target contracts, and claim REFLOW rewards on-chain via Merkle proofs.

## Stack

Next.js (App Router) · TypeScript · Tailwind + shadcn/ui · wagmi v3 + viem ·
TanStack Query · SIWE

## Pages

- `/` — live transfer feed + token stats (Redis-backed, from the indexer)
- `/campaigns` — campaign list, create modal, leaderboard drawer, enrollment
- `/wallet` — wallet explorer: eligibility across campaigns + rewards
  (claim on-chain, view claim tx)

## Setup

```bash
pnpm install
cp .env.example .env    # adjust if your backend isn't on :8000
pnpm dev
```

Requires the Reflow backend running (API on `:8000`) and MetaMask on
**Base Sepolia (84532)**.

## Configuration (`.env`)

| Var | Meaning |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base (default `http://localhost:8000`) |
| `NEXT_PUBLIC_CHAIN_ID` | The single chain this app operates on (`84532`) |
| `NEXT_PUBLIC_DISTRIBUTOR_ADDRESS` | RewardDistributor contract |
| `NEXT_PUBLIC_REWARD_TOKEN_ADDRESS` | REFLOW token contract |

Platform-level contract facts (addresses, reward token decimals/symbol) are
centralized in `lib/contracts.ts`. This is a single-chain app by design —
hooks own the chain id internally; nothing passes it per call site.

## Conventions

- **Amounts are base units (wei) everywhere** on the wire and in state.
  Conversion happens only at edges: `toBaseUnits` on form submit,
  `lib/format.ts` (`formatUnits`-based) on display. Amounts are JSON
  **strings**, never numbers.
- The claim flow is pure wallet auth (the transaction signature) — no SIWE.
  SIWE guards backend writes (enrollment) via httpOnly JWT cookie.
- `claimed` state is mirrored from on-chain events by the backend's
  ClaimWatcher — the UI refetches into truth rather than tracking optimistically.

## Structure

```
app/            pages + per-page _components/
components/     shared components, shadcn/ui
hooks/          one hook per concern (use-claim-reward, use-wallet-claims, …)
lib/api/        typed API client modules (one per resource)
lib/contracts.ts  chain id, contract addresses, distributor ABI fragment
lib/format.ts   amount formatting (single source for reward decimals)
```