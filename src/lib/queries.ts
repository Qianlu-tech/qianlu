"use client";

import { useQuery } from "@tanstack/react-query";
import {
  api,
  apiEnabled,
  type Activity,
  type CorridorBar,
  type DocRow,
  type FinancingPosition,
  type HomeCorridor,
  type HomeStat,
  type InvoiceRow,
  type KV,
  type LabelValue,
  type SettlementRecord,
  type Stat,
  type TokenOverview,
  type VolumePoint,
} from "./api";

/**
 * Fetches from the backend.
 *
 * - When the backend is NOT configured (`apiEnabled() === false`), the query is
 *   disabled and the hook returns `offline` — the local demo data, so the UI
 *   still renders during pure-frontend development with no API.
 * - When the backend IS configured, it fetches the real data and shows `empty`
 *   while loading or on error — it never substitutes demo numbers for real ones.
 *   For authed (per-wallet) data `empty` is an empty list/object; for public
 *   marketing data it's the static copy (a polished placeholder, not fake user
 *   data) that gets swapped for live values the moment they arrive.
 */
function useApiData<T>(key: unknown[], fetcher: () => Promise<T>, offline: T, empty: T): T {
  const online = apiEnabled();
  const { data } = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled: online,
    // Online: start empty (loading) and keep empty on error — no demo masking.
    // Offline: serve the local demo data so the UI isn't blank with no backend.
    initialData: online ? empty : offline,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  return (data ?? (online ? empty : offline)) as T;
}

/* Authed, per-wallet data — never show demo rows; empty until the real data lands. */
export const useInvoices = (fb: InvoiceRow[]) => useApiData(["invoices"], api.invoices, fb, []);

export const useDashboardStats = (fb: Stat[]) =>
  useApiData(["dashboard", "stats"], api.dashboardStats, fb, []);
export const useDashboardActivity = (fb: Activity[]) =>
  useApiData(["dashboard", "activity"], api.activity, fb, []);
export const useVolume = (fb: VolumePoint[]) =>
  useApiData(["dashboard", "volume"], () => api.volume(30), fb, []);
export const useCorridors = (fb: CorridorBar[]) =>
  useApiData(["dashboard", "corridors"], api.corridors, fb, []);

export const useSettlementRecords = (fb: SettlementRecord[]) =>
  useApiData(["settlement", "records"], api.settlementRecords, fb, []);
export const useSettlementStats = (fb: LabelValue[]) =>
  useApiData(["settlement", "stats"], api.settlementStats, fb, []);
export const useSettlementLifecycle = (fb: string[]) =>
  useApiData(["settlement", "lifecycle"], api.settlementLifecycle, fb, []);

export const useFinancingPositions = (fb: FinancingPosition[]) =>
  useApiData(["financing", "positions"], api.financingPositions, fb, []);

export const useDocuments = (fb: DocRow[]) => useApiData(["documents", "list"], api.documents, fb, []);
export const useDocumentsStorage = (fb: KV[]) =>
  useApiData(["documents", "storage"], api.documentsStorage, fb, []);

export const usePaymentsRecents = (fb: string[]) =>
  useApiData(["payments", "recents"], api.paymentsRecents, fb, []);

/* Public/protocol data — keep the static copy as a placeholder while the live
   values load (avoids an empty-flash on the marketing + token pages). */
export const usePublicStats = (fb: HomeStat[]) => useApiData(["public", "stats"], api.publicStats, fb, fb);
export const usePublicCorridors = (fb: HomeCorridor[]) =>
  useApiData(["public", "corridors"], api.publicCorridors, fb, fb);

export const useTokenOverview = (fb: TokenOverview) =>
  useApiData(["token", "overview"], api.tokenOverview, fb, fb);
