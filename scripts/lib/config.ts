import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

export const JUPITER_API_BASE = "https://api.jup.ag";

/** Well-known mainnet mints for convenience */
export const MINTS = {
  SOL: "So11111111111111111111111111111111111111112",
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

export function getJupiterApiKey(): string {
  const key = process.env.JUPITER_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "JUPITER_API_KEY tidak ditemukan. Salin .env.example ke .env dan isi API key dari portal.jup.ag"
    );
  }
  return key;
}

export function getSolanaRpcUrl(): string {
  return (
    process.env.SOLANA_RPC_URL?.trim() ||
    "https://api.devnet.solana.com"
  );
}

export function getMainnetRpcUrl(): string {
  return (
    process.env.MAINNET_RPC_URL?.trim() ||
    "https://api.mainnet-beta.solana.com"
  );
}

export function getWalletKeypairPath(): string | undefined {
  const path = process.env.WALLET_KEYPAIR_PATH?.trim();
  return path || undefined;
}
