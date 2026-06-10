/**
 * Typed client for the Qianlu backend.
 *
 * Base URL comes from NEXT_PUBLIC_API_BASE_URL. When it's unset, `apiEnabled()`
 * is false and callers should fall back to local data (see src/lib/queries.ts).
 * Endpoints + shapes follow backend.md. The wallet JWT (set after SIWE verify)
 * is attached automatically.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
export const apiEnabled = () => API_BASE.length > 0;

/* ----- session token (set by the SIWE /auth/verify exchange) ----- */
const TOKEN_KEY = "qianlu-jwt";
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem(TOKEN_KEY);
}

/**
 * True when a non-expired JWT is stored. Used to decide whether a restored
 * wallet session can skip re-signing — a stale/expired token would otherwise
 * 401 every authed call and silently fall back to placeholder data.
 */
export function hasValidToken(): boolean {
  const t = getToken();
  if (!t) return false;
  try {
    const payload = t.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" && json.exp * 1000 > Date.now() + 5_000;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

type FetchOpts = { method?: string; body?: unknown; signal?: AbortSignal };

export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  if (!API_BASE) throw new ApiError("API base URL not configured", "NO_API_BASE", 0);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    // Backend echoes our origin + `Access-Control-Allow-Credentials: true`, so
    // send credentials (covers any cookie-based session the backend may add).
    credentials: "include",
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(err?.message ?? res.statusText, err?.code ?? `HTTP_${res.status}`, res.status);
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/*  Shapes — match what the UI renders (terse keys; see backend.md)    */
/* ------------------------------------------------------------------ */

export type Asset = "USDT" | "FDUSD" | "USDC";
export type InvoiceRow = { id: string; to: string; amt: number; asset: string; status: string; days: number };
export type InvoiceDetail = { id: string; amount: number; from: string; to: string; asset?: Asset };
export type Stat = { l: string; v: string; d: string };
export type Activity = { t: string; d: string; k: string };
export type VolumePoint = { d: number; v: number };
export type CorridorBar = { n: string; v: number };
export type SettlementRecord = { date: string; from: string; to: string; amt: number; asset: string; tx: string };
export type LabelValue = { l: string; v: string };
export type FinancingPosition = { id: string; coll: string; bor: string; apy: string };
export type DocRow = { name: string; type: string; hash: string; time: string };
export type KV = { k: string; v: string };
export type HomeStat = { v: string; l: string };
export type HomeCorridor = { from: string; to: string; asset: string; vol: string; fee: string };
export type TokenTier = { stake: string; off: string; pay: string };
export type TokenUtility = { t: string; d: string };
export type TokenDist = { l: string; v: number };
export type TokenOverview = { tiers: TokenTier[]; utility: TokenUtility[]; dist: TokenDist[] };
export type VerifyResult = {
  localHash: string;
  found: boolean;
  greenfieldCid?: string;
  easAttestation?: { uid: string; attester: string; schema: string; time: string };
  result: "authentic" | "unknown" | "revoked";
};

const unwrapItems = <T>(p: Promise<{ items: T[] }>) => p.then((r) => r.items);

/* ----- auth (SIWE) ----- */
export const authApi = {
  nonce: (address: string, chainId: number) =>
    apiFetch<{ nonce: string; message: string; expiresAt: string }>("/auth/nonce", {
      method: "POST",
      body: { address, chainId },
    }),
  verify: (address: string, message: string, signature: string) =>
    apiFetch<{ token: string; expiresAt?: string; address: string }>("/auth/verify", {
      method: "POST",
      body: { address, message, signature },
    }),
  session: () => apiFetch<{ address: string; chainId: number }>("/auth/session"),
};

/* ----- data ----- */
export const api = {
  invoices: () => unwrapItems(apiFetch<{ items: InvoiceRow[] }>("/invoices")),
  invoice: (id: string) => apiFetch<InvoiceDetail>(`/invoices/${encodeURIComponent(id)}`),
  dashboardStats: () => apiFetch<{ stats: Stat[] }>("/dashboard/summary").then((r) => r.stats),
  volume: (days = 30) => apiFetch<{ points: VolumePoint[] }>(`/dashboard/volume?days=${days}`).then((r) => r.points),
  corridors: () => unwrapItems(apiFetch<{ items: CorridorBar[] }>("/dashboard/corridors")),
  activity: () => unwrapItems(apiFetch<{ items: Activity[] }>("/dashboard/activity")),
  settlementRecords: () => unwrapItems(apiFetch<{ items: SettlementRecord[] }>("/settlement/records")),
  settlementStats: () => apiFetch<{ stats: LabelValue[] }>("/settlement/stats").then((r) => r.stats),
  settlementLifecycle: () => apiFetch<{ steps: string[] }>("/settlement/lifecycle").then((r) => r.steps),
  financingPositions: () => unwrapItems(apiFetch<{ items: FinancingPosition[] }>("/financing/positions")),
  documents: () => unwrapItems(apiFetch<{ items: DocRow[] }>("/documents")),
  documentsStorage: () => apiFetch<{ status: KV[] }>("/documents/storage").then((r) => r.status),
  paymentsRecents: () => apiFetch<{ addresses: string[] }>("/payments/recents").then((r) => r.addresses),
  publicStats: () => apiFetch<{ stats: HomeStat[] }>("/public/stats").then((r) => r.stats),
  publicCorridors: () => unwrapItems(apiFetch<{ items: HomeCorridor[] }>("/public/corridors")),
  tokenOverview: () => apiFetch<TokenOverview>("/token/overview"),
  verify: (hash: string) => apiFetch<VerifyResult>(`/verify/${encodeURIComponent(hash)}`),
};
