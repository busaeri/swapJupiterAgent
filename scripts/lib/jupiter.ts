import { getJupiterApiKey, JUPITER_API_BASE } from "./config.js";

export class JupiterApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "JupiterApiError";
  }
}

export class JupiterRateLimitError extends JupiterApiError {
  constructor(public readonly retryAfterSeconds: number) {
    super(`Rate limited. Coba lagi dalam ${retryAfterSeconds}s`, 429);
    this.name = "JupiterRateLimitError";
  }
}

export async function jupiterFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const apiKey = getJupiterApiKey();
  const url = path.startsWith("http") ? path : `${JUPITER_API_BASE}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After")) || 10;
    throw new JupiterRateLimitError(retryAfter);
  }

  if (!res.ok) {
    const raw = await res.text();
    let body: unknown = { message: raw || `HTTP ${res.status}` };
    try {
      body = raw ? JSON.parse(raw) : body;
    } catch {
      // keep text fallback
    }
    const msg =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : `Jupiter API error: HTTP ${res.status}`;
    throw new JupiterApiError(msg, res.status, body);
  }

  return res.json() as Promise<T>;
}

export interface OrderParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  taker?: string;
  slippageBps?: number;
}

export interface OrderResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold?: string;
  swapMode?: string;
  slippageBps?: number;
  priceImpactPct?: string;
  routePlan?: unknown[];
  requestId?: string;
  transaction?: string | null;
  router?: string;
  mode?: string;
  gasless?: boolean;
  signatureFeeLamports?: number;
  prioritizationFeeLamports?: number;
  rentFeeLamports?: number;
  error?: string;
  errorMessage?: string;
}

export interface ExecuteParams {
  signedTransaction: string;
  requestId: string;
}

export interface ExecuteResponse {
  status: string;
  signature?: string;
  error?: string;
  code?: string;
  inputAmountResult?: string;
  outputAmountResult?: string;
}

export async function getOrder(params: OrderParams): Promise<OrderResponse> {
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
  });

  if (params.taker) {
    search.set("taker", params.taker);
  }
  if (params.slippageBps !== undefined) {
    search.set("slippageBps", String(params.slippageBps));
  }

  return jupiterFetch<OrderResponse>(`/swap/v2/order?${search.toString()}`);
}

export async function executeSwap(
  params: ExecuteParams
): Promise<ExecuteResponse> {
  return jupiterFetch<ExecuteResponse>("/swap/v2/execute", {
    method: "POST",
    body: JSON.stringify({
      signedTransaction: params.signedTransaction,
      requestId: params.requestId,
    }),
  });
}
