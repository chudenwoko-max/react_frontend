import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const PREFIX = "idempotency:";

/**
 * Sanitize the storage key so SecureStore/localStorage never receives
 * illegal characters (slashes, spaces, unicode, emojis, etc.)
 *
 * IMPORTANT:
 * - This does NOT change the reference_id sent to the API.
 * - Only the storage key is sanitized.
 */
function storeKey(operationKey: string) {
  return `idemp_${operationKey.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

/**
 * UUID generator (no crypto dependency)
 */
function newId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create an idempotency reference_id.
 *
 * IMPORTANT:
 * - The reference_id returned here is EXACTLY what is sent to the API.
 * - Only the storage key is sanitized.
 */
export async function getOrCreateReferenceId(operationKey: string) {
  const key = storeKey(operationKey); // ⭐ PATCH: sanitized storage key
  const existing = await getItem(key);
  if (existing) return existing;

  const id = newId();
  await setItem(key, id);
  return id;
}

/**
 * Clear the stored idempotency key.
 *
 * IMPORTANT:
 * - Uses sanitized storage key.
 * - Does NOT modify the reference_id value.
 */
export async function clearReferenceId(operationKey: string) {
  const key = storeKey(operationKey); // ⭐ PATCH: sanitized storage key
  await deleteItem(key);
}
