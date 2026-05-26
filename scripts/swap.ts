#!/usr/bin/env tsx
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { VersionedTransaction } from "@solana/web3.js";
import { parseArgs } from "./lib/cli.js";
import { executeSwap, getOrder } from "./lib/jupiter.js";
import { loadWalletKeypair } from "./lib/wallet.js";

function printSummary(order: Awaited<ReturnType<typeof getOrder>>): void {
  console.log("\n=== Swap Summary (MAINNET) ===\n");
  console.log(`Input mint:   ${order.inputMint}`);
  console.log(`Output mint:  ${order.outputMint}`);
  console.log(`In amount:    ${order.inAmount} (raw)`);
  console.log(`Out amount:   ${order.outAmount} (raw)`);
  if (order.priceImpactPct) {
    console.log(`Price impact: ${order.priceImpactPct}%`);
  }
  if (order.router) {
    console.log(`Router:       ${order.router}`);
  }
  if (order.requestId) {
    console.log(`Request ID:   ${order.requestId}`);
  }
  console.log("\nPERINGATAN: Swap ini menggunakan token dan biaya mainnet nyata.\n");
}

async function promptConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(
      'Ketik YES untuk melanjutkan sign & execute (atau gunakan flag --confirmed jika sudah disetujui di chat): '
    );
    return answer.trim().toUpperCase() === "YES";
  } finally {
    rl.close();
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const wallet = loadWalletKeypair();
  const taker = args.taker ?? wallet.publicKey.toBase58();

  const order = await getOrder({
    inputMint: args.inputMint,
    outputMint: args.outputMint,
    amount: args.amount,
    taker,
    slippageBps: args.slippageBps,
  });

  if (order.error || order.errorMessage) {
    console.error("Order error:", order.error ?? order.errorMessage);
    process.exit(1);
  }

  if (!order.transaction) {
    console.error("Response tidak berisi transaction. Pastikan taker valid.");
    process.exit(1);
  }

  if (!order.requestId) {
    console.error("Response tidak berisi requestId.");
    process.exit(1);
  }

  printSummary(order);

  let proceed = args.confirmed;
  if (!proceed) {
    proceed = await promptConfirmation();
  } else {
    console.log("Flag --confirmed: melewati prompt terminal (konfirmasi chat diasumsikan sudah diberikan).\n");
  }

  if (!proceed) {
    console.log("Swap dibatalkan. Tidak ada transaksi yang ditandatangani.");
    process.exit(0);
  }

  const tx = VersionedTransaction.deserialize(
    Buffer.from(order.transaction, "base64")
  );
  tx.sign([wallet]);

  const signedTransaction = Buffer.from(tx.serialize()).toString("base64");

  console.log("Mengirim ke Jupiter /execute...\n");

  const result = await executeSwap({
    signedTransaction,
    requestId: order.requestId,
  });

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("=== Execute Result ===\n");
  console.log(`Status:     ${result.status}`);
  if (result.signature) {
    console.log(`Signature:  ${result.signature}`);
    console.log(`Explorer:   https://solscan.io/tx/${result.signature}`);
  }
  if (result.inputAmountResult) {
    console.log(`In result:  ${result.inputAmountResult}`);
  }
  if (result.outputAmountResult) {
    console.log(`Out result: ${result.outputAmountResult}`);
  }
  if (result.error) {
    console.log(`Error:      ${result.error}`);
  }
  if (result.code) {
    console.log(`Code:       ${result.code}`);
  }
  console.log();

  if (result.status !== "Success") {
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
