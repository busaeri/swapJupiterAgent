# Swap Jupiter Agent

Proyek **Cursor Agent** untuk membantu swap token di Solana melalui [Jupiter Swap API v2](https://dev.jup.ag/docs/swap/order-and-execute). Agent tidak melakukan auto-trade: execute hanya setelah konfirmasi eksplisit Anda.

## Prasyarat

- Node.js 20+
- API key Jupiter dari [portal.jup.ag](https://portal.jup.ag/)
- (Opsional) Wallet keypair untuk execute swap di mainnet

## Setup

```bash
cp .env.example .env
# Edit .env — isi JUPITER_API_KEY
npm install
```

## Perintah CLI

### Quote (aman, tanpa sign)

```bash
npm run quote -- \
  --input-mint So11111111111111111111111111111111111111112 \
  --output-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --amount 10000000
```

Tambahkan `--taker <PUBKEY>` jika ingin response berisi transaksi yang siap ditandatangani.

### Swap (butuh konfirmasi)

```bash
npm run swap -- \
  --input-mint So11111111111111111111111111111111111111112 \
  --output-mint EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v \
  --amount 10000000 \
  --confirmed
```

Flag `--confirmed` hanya dipakai setelah Anda menyetujui swap di chat dengan agent. Tanpa flag, script berhenti di ringkasan quote.

## Memakai di Cursor

1. Buka folder ini di Cursor.
2. Skill `swap-jupiter` dan rule keamanan aktif otomatis.
3. Contoh prompt: *"Quote 0.01 SOL ke USDC"* atau *"Jelaskan rute swap ini"*.
4. Untuk execute, konfirmasi tegas di chat, lalu jalankan `npm run swap` dengan `--confirmed`.

## Devnet vs mainnet

| Aspek | Catatan |
|-------|---------|
| Jupiter Swap API | Hanya **mainnet** (`api.jup.ag/swap/v2`) |
| `SOLANA_RPC_URL` | Default devnet — untuk development wallet |
| Execute swap | Memakai token & biaya **mainnet nyata** |

Mode pengembangan aman: gunakan `npm run quote` dulu tanpa execute.

## Keamanan

- Jangan commit `.env` atau file keypair.
- Jangan bagikan seed phrase di chat.
- Verifikasi mint address token sebelum swap.
- Swap memiliki risiko slippage dan biaya jaringan.

## Struktur

```
.cursor/skills/swap-jupiter/   # Panduan agent
.cursor/rules/                 # Aturan keamanan
scripts/                       # CLI quote & swap
AGENTS.md                      # Ringkasan untuk agent
```

## Referensi

- [Jupiter Swap v2 docs](https://dev.jup.ag/docs/swap/order-and-execute)
- [Jupiter Developer Portal](https://portal.jup.ag/)
# swapJupiterAgent
