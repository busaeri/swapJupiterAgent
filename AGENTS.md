# Swap Jupiter Agent

Cursor agent project untuk swap token Solana via **Jupiter Swap API v2**.

## Tujuan

- Membantu user mendapatkan **quote** swap terbaik.
- Menjalankan **execute** hanya setelah konfirmasi eksplisit user di chat.
- Tidak melakukan auto-trading atau sign tanpa persetujuan.

## Perintah

| Perintah | Fungsi |
|----------|--------|
| `npm run quote -- --input-mint ... --output-mint ... --amount ...` | Quote saja (aman) |
| `npm run swap -- ... --confirmed` | Order → sign → execute (mainnet) |

## Environment

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `JUPITER_API_KEY` | Ya | Dari portal.jup.ag |
| `SOLANA_RPC_URL` | Tidak | Default devnet |
| `WALLET_KEYPAIR_PATH` | Untuk swap | Path keypair JSON |

## Workflow agent

1. **Default quote-only** — jalankan `npm run quote` dan jelaskan hasil ke user.
2. **Konfirmasi wajib** — sebelum swap, tampilkan ringkasan (pair, amount, slippage, router, price impact) dan minta persetujuan teks eksplisit.
3. **Execute** — hanya setelah user setuju, jalankan `npm run swap` dengan `--confirmed`.
4. **Jangan** baca `.env`, keypair, atau seed phrase ke dalam respons.

## Batasan

- Jupiter Swap API hanya **mainnet** — jelaskan ke user jika mereka mengharapkan devnet swap via API.
- Transaksi order ber-TTL ~2 menit; re-quote jika delay lama.
- `/build` path tidak memakai `/execute`.

## Skill & rules

- Skill: `.cursor/skills/swap-jupiter/SKILL.md`
- Safety: `.cursor/rules/jupiter-swap-safety.mdc` (always apply)
