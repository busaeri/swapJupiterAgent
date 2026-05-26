#!/usr/bin/env tsx
import { parseArgs } from "./lib/cli.js";
import { getOrder } from "./lib/jupiter.js";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  const order = await getOrder({
    inputMint: args.inputMint,
    outputMint: args.outputMint,
    amount: args.amount,
    taker: args.taker,
    slippageBps: args.slippageBps,
  });

  if (order.error || order.errorMessage) {
    console.error("Order error:", order.error ?? order.errorMessage);
    process.exit(1);
  }

  if (args.json) {
    console.log(JSON.stringify(order, null, 2));
    return;
  }

  console.log("\n=== Jupiter Quote ===\n");
  console.log(`Input mint:   ${order.inputMint}`);
  console.log(`Output mint:  ${order.outputMint}`);
  console.log(`In amount:    ${order.inAmount} (raw)`);
  console.log(`Out amount:   ${order.outAmount} (raw, before slippage)`);
  if (order.otherAmountThreshold) {
    console.log(`Min out:      ${order.otherAmountThreshold} (raw)`);
  }
  if (order.priceImpactPct) {
    console.log(`Price impact: ${order.priceImpactPct}%`);
  }
  if (order.slippageBps !== undefined) {
    console.log(`Slippage:     ${order.slippageBps} bps`);
  }
  if (order.router) {
    console.log(`Router:       ${order.router}`);
  }
  if (order.mode) {
    console.log(`Mode:         ${order.mode}`);
  }
  if (order.requestId) {
    console.log(`Request ID:   ${order.requestId}`);
  }
  console.log(
    `Transaction:  ${order.transaction ? "included (sign with taker)" : "not included (add --taker)"}`
  );
  console.log("\nCatatan: Jupiter Swap API menggunakan mainnet. Execute memerlukan konfirmasi eksplisit.\n");
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
