import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Keypair } from "@solana/web3.js";
import { getWalletKeypairPath } from "./config.js";

export function loadKeypairFromPath(filePath: string): Keypair {
  const absolute = resolve(filePath);
  const raw = readFileSync(absolute, "utf-8");
  const secret = JSON.parse(raw) as number[];
  if (!Array.isArray(secret) || secret.length < 32) {
    throw new Error(`Format keypair tidak valid: ${absolute}`);
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

export function loadWalletKeypair(): Keypair {
  const path = getWalletKeypairPath();
  if (!path) {
    throw new Error(
      "WALLET_KEYPAIR_PATH tidak diset. Tambahkan path keypair JSON di .env untuk execute swap."
    );
  }
  return loadKeypairFromPath(path);
}
