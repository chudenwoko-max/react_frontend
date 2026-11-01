import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import {
  isBiometricEnabled,
  authenticateWithBiometrics,
} from "../utils/biometric";

const IDLE_MS = 5 * 60 * 1000;

export function useBiometricLock(isLoggedIn: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const appState = useRef(AppState.currentState);
  const shouldLockOnActive = useRef(false);
  const lastActivity = useRef(Date.now());

  const recordActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLocked(false);
      setIsChecking(false);
      return;
    }

    isBiometricEnabled()
      .then((enabled) => setIsLocked(!!enabled))
      .catch(() => setIsLocked(false))
      .finally(() => setIsChecking(false));

    // CHANGE: check idle on an interval so a cleared timeout cannot skip the lock.
    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivity.current;
      if (idleFor >= IDLE_MS) {
        console.log("Payhost idle lock");
        setIsLocked(true);
      }
    }, 5000);

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          shouldLockOnActive.current = true;
        }
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active" &&
          shouldLockOnActive.current &&
          isLoggedIn
        ) {
          const enabled = await isBiometricEnabled();
          if (enabled) setIsLocked(true);
          shouldLockOnActive.current = false;
        }
        appState.current = nextAppState;
      }
    );

    let removeWeb: (() => void) | undefined;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onInput = () => {
        lastActivity.current = Date.now();
      };
      window.addEventListener("pointerdown", onInput);
      window.addEventListener("keydown", onInput);
      removeWeb = () => {
        window.removeEventListener("pointerdown", onInput);
        window.removeEventListener("keydown", onInput);
      };
    }

    return () => {
      clearInterval(interval);
      subscription.remove();
      removeWeb?.();
    };
  }, [isLoggedIn]);

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const result = await authenticateWithBiometrics("Unlock Payhost");
    if (result.success) {
      setIsLocked(false);
      lastActivity.current = Date.now();
      return true;
    }
    return false;
  };

  const unlockManually = () => {
    setIsLocked(false);
    lastActivity.current = Date.now();
  };

  return {
    isLocked,
    isChecking,
    unlockWithBiometrics,
    unlockManually,
    recordActivity,
    setIsLocked,
  };
}