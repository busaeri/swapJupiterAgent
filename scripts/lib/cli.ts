export interface CliArgs {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
  slippageBps?: number;
  confirmed?: boolean;
  json?: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2).replace(/-/g, "");
    const next = argv[i + 1];

    if (key === "confirmed" || key === "json") {
      args[key] = true;
      continue;
    }

    if (next && !next.startsWith("--")) {
      args[key] = next;
      i++;
    }
  }

  const inputMint = args.inputmint as string | undefined;
  const outputMint = args.outputmint as string | undefined;
  const amount = args.amount as string | undefined;

  if (!inputMint || !outputMint || !amount) {
    throw new Error(
      "Usage: --input-mint <mint> --output-mint <mint> --amount <raw_units> [--taker <pubkey>] [--slippage-bps <bps>] [--confirmed] [--json]"
    );
  }

  const slippageRaw = args.slippagebps as string | undefined;

  return {
    inputMint,
    outputMint,
    amount,
    taker: args.taker as string | undefined,
    slippageBps: slippageRaw ? Number(slippageRaw) : undefined,
    confirmed: Boolean(args.confirmed),
    json: Boolean(args.json),
  };
}

export function formatLamports(lamports: string, decimals = 9): string {
  const n = BigInt(lamports);
  const divisor = 10n ** BigInt(decimals);
  const whole = n / divisor;
  const frac = n % divisor;
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}
