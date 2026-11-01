import axiosClient from "./axiosClient";

export const FINANCIALS_REFRESH = "FINANCIALS_REFRESH";

export type Snapshot = {
  balance?: string | number;
  available?: string | number;
  [key: string]: unknown;
};

export type HistoryItem = {
  id?: string | number;
  type?: string;
  kind?: string;
  amount?: string | number;
  created_at?: string;
  reference?: string;
  [key: string]: unknown;
};

function bust() {
  return { _t: Date.now() };
}

export async function fetchSnapshot(): Promise<Snapshot> {
  const { data } = await axiosClient.get("wallet/snapshot/", {
    params: bust(),
  });
  return data;
}

export async function fetchRecentTransactions(): Promise<HistoryItem[]> {
  const { data } = await axiosClient.get("transactions/", {
    params: { ...bust(), limit: 20 },
  });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.transactions)) return data.transactions;
  return [];
}

export async function initializeFunding(payload: {
  amount: number | string;
  email?: string;
}) {
  const { data } = await axiosClient.post("wallet/fund/initialize/", payload);
  return data;
}

/** P2P only. Recipient is another consumer username/id — not merchant id. */
export async function sendToUser(payload: {
  recipient: string;
  amount: number | string;
  note?: string;
}) {
  const { data } = await axiosClient.post("wallet/send/", payload);
  return data;
}

export async function payMerchantWallet(payload: {
  merchant_id: number | string;
  amount: number | string;
}) {
  const { data } = await axiosClient.post("merchant/pay-wallet/", payload);
  return data;
}

export async function payMerchantCard(payload: {
  merchant_id: number | string;
  amount: number | string;
  authorization_code?: string;
}) {
  const { data } = await axiosClient.post("merchant/pay-card/", payload);
  return data;
}

export async function payMerchantCheckout(payload: {
  merchant_id: number | string;
  amount: number | string;
}) {
  const { data } = await axiosClient.post("merchant/pay-checkout/", payload);
  return data;
}

export function mapLedgerToHistory(row: any): HistoryItem {
  const kind = row.kind || row.type || "";
  const type =
    kind === "merchant_pay" || kind === "merchant_pay_wallet"
      ? "transfer"
      : kind;
  return { ...row, type, kind };
}