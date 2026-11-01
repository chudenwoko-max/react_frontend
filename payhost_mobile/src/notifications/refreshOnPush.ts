import { DeviceEventEmitter } from "react-native";
import axiosClient from "../api/axiosClient";

export const FINANCIALS_REFRESH = "orbitpay:financials-refresh";

export async function refreshFinancialsFromPush() {
  try {
    const [balanceRes, notifRes] = await Promise.all([
      axiosClient.get("wallet/balance/"),
      axiosClient.get("notifications/"),
    ]);

    DeviceEventEmitter.emit(FINANCIALS_REFRESH, {
      balance: balanceRes.data?.balance ?? null,
      unreadCount: notifRes.data?.unread_count ?? 0,
    });
  } catch (e) {
    console.log("Push refresh error:", e);
    DeviceEventEmitter.emit(FINANCIALS_REFRESH, {});
  }
}