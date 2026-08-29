import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const PREFIX = "idempotency:";

async function setItem(key: string, value: string) {
  if (Platform.OS === "web") localStorage.setItem(key, value);
  else await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === "web") return localStorage.getItem(key);
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === "web") localStorage.removeItem(key);
  else await SecureStore.deleteItemAsync(key);
}

function newId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateReferenceId(operationKey: string) {
  const storeKey = PREFIX + operationKey;
  const existing = await getItem(storeKey);
  if (existing) return existing;
  const id = newId();
  await setItem(storeKey, id);
  return id;
}

export async function clearReferenceId(operationKey: string) {
  await deleteItem(PREFIX + operationKey);
}