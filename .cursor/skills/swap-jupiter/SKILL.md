---
name: swap-jupiter
description: >-
  Panduan swap token Solana via Jupiter Swap API v2 (order + execute).
  Gunakan untuk quote, rute swap, sign/execute, dan debugging API Jupiter.
  Wajib konfirmasi eksplisit user sebelum execute. Triggers: swap, quote,
  jupiter, SOL, USDC, mint, dex aggregator.
---

# Swap Jupiter (API v2)

Skill proyek untuk integrasi **Jupiter Swap API v2** di repo `swapJupiterAgent`.

**Base URL**: `https://api.jup.ag`  
**Swap path**: `/swap/v2`  
**Auth**: header `x-api-key` dari [portal.jup.ag](https://portal.jup.ag/) — variabel env `JUPITER_API_KEY`

## Kapan memakai

- User minta quote, swap, konversi token, atau rute terbaik via Jupiter.
- Debugging error Jupiter (`429`, slippage, invalid mint).
- Menjalankan CLI proyek: `npm run quote`, `npm run swap`.

Jangan memakai untuk tugas Solana generik tanpa Jupiter, atau UI saja tanpa keputusan API.

## Kebijakan keamanan (wajib)

1. **Default quote-only** — `npm run quote` tanpa execute.
2. **Konfirmasi eksplisit** di chat sebelum sign/execute.
3. **Mainnet** — Jupiter Swap API v2 hanya mainnet; jelaskan risiko biaya nyata.
4. Jangan baca/commit `.env`, keypair, atau seed phrase.

## Happy path: Meta-Aggregator

```
GET /swap/v2/order  →  sign transaction  →  POST /swap/v2/execute
```

| Langkah | Endpoint | Catatan |
|---------|----------|---------|
| Quote + tx | `GET /swap/v2/order` | Params: `inputMint`, `outputMint`, `amount` (raw), `taker` (wajib untuk tx) |
| Execute | `POST /swap/v2/execute` | Body: `signedTransaction` (base64), `requestId` dari order |

Response order penting: `outAmount`, `requestId`, `transaction`, `router`, `mode`, `priceImpactPct`.

## CLI proyek

```bash
# Quote aman
npm run quote -- --input-mint <mint> --output-mint <mint> --amount <raw> [--taker <pubkey>] [--json]

# Swap (setelah konfirmasi user di chat)
npm run swap -- --input-mint <mint> --output-mint <mint> --amount <raw> --confirmed [--taker <pubkey>]
```

Mint umum mainnet:
- SOL: `So11111111111111111111111111111111111111112`
- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`

## Pola fetch (TypeScript)

Gunakan modul proyek `scripts/lib/jupiter.ts`:

```typescript
import { getOrder, executeSwap } from "./scripts/lib/jupiter.js";

const order = await getOrder({
  inputMint, outputMint, amount, taker,
});
// order.transaction → sign → executeSwap({ signedTransaction, requestId: order.requestId })
```

## Gotchas

| Isu | Solusi |
|-----|--------|
| TTL ~2 menit | Re-quote sebelum execute jika delay |
| Tanpa `taker` | Order tanpa `transaction` — quote saja |
| `/build` path | Raw instructions; **tidak** pakai `/execute` |
| Rate limit 429 | Tunggu `Retry-After`, kurangi frekuensi |
| Devnet swap via API | Tidak didukung — API = mainnet |

## Workflow agent

1. Parse intent user (mint in/out, amount human atau raw).
2. Jalankan `npm run quote` dan jelaskan hasil (router, out amount, price impact).
3. Jika user minta execute → ringkasan + minta konfirmasi teks eksplisit.
4. Setelah setuju → `npm run swap ... --confirmed` (butuh `WALLET_KEYPAIR_PATH` di `.env`).
5. Laporkan signature / status execute; link Solscan jika sukses.

## Referensi

- Detail endpoint & error: [reference.md](reference.md)
- Docs resmi: https://dev.jup.ag/docs/swap/order-and-execute
- Skill lengkap Jupiter: https://github.com/jup-ag/agent-skills
