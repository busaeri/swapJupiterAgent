# Jupiter Swap v2 — Referensi Singkat

## GET /swap/v2/order

**Query parameters (utama)**

| Param | Wajib | Deskripsi |
|-------|-------|-----------|
| `inputMint` | Ya | Mint address token masuk |
| `outputMint` | Ya | Mint address token keluar |
| `amount` | Ya | Jumlah dalam unit terkecil (lamports untuk SOL) |
| `taker` | Untuk tx | Pubkey wallet penandatangan |
| `slippageBps` | Tidak | Slippage basis points (default dari Jupiter) |

**Response fields (utama)**

| Field | Deskripsi |
|-------|-----------|
| `inAmount` / `outAmount` | Jumlah raw masuk/keluar |
| `otherAmountThreshold` | Minimum out setelah slippage |
| `requestId` | Wajib untuk `/execute` |
| `transaction` | Base64 unsigned tx (null tanpa `taker`) |
| `router` | `iris`, `jupiterz`, `dflow`, `okx` |
| `mode` | `ultra` atau `manual` |
| `priceImpactPct` | Dampak harga estimasi |

## POST /swap/v2/execute

**Body**

```json
{
  "signedTransaction": "<base64>",
  "requestId": "<dari order>"
}
```

**Response**

| Field | Deskripsi |
|-------|-----------|
| `status` | `Success` atau `Failed` |
| `signature` | Tx signature di Solana |
| `inputAmountResult` / `outputAmountResult` | Hasil aktual |
| `error` / `code` | Jika gagal |

## HTTP errors

| Status | Arti | Tindakan |
|--------|------|----------|
| 401 | API key invalid/missing | Cek `JUPITER_API_KEY` |
| 429 | Rate limit | Tunggu Retry-After |
| 400 | Param invalid | Verifikasi mint & amount |

## Router path (advanced)

`GET /swap/v2/build` — raw instructions, Metis only.  
Tidak kompatibel dengan `POST /swap/v2/execute`. Submit via RPC sendiri.

## Environment proyek

| Variabel | Fungsi |
|----------|--------|
| `JUPITER_API_KEY` | Auth REST |
| `SOLANA_RPC_URL` | RPC devnet (wallet dev) |
| `MAINNET_RPC_URL` | RPC mainnet (opsional) |
| `WALLET_KEYPAIR_PATH` | Keypair untuk sign swap |

## Links

- [Order & Execute guide](https://dev.jup.ag/docs/swap/order-and-execute)
- [API reference](https://developers.jup.ag/docs/api-reference)
- [Developer portal](https://portal.jup.ag/)
