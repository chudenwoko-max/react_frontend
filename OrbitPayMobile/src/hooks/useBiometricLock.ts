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
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearIdle = () => {
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };

  const armIdle = useCallback(() => {
    clearIdle();
    if (!isLoggedIn) return;
    idleTimer.current = setTimeout(() => {
      setIsLocked(true);
    }, IDLE_MS);
  }, [isLoggedIn]);

  // CHANGE: any touch resets the 5-minute idle lock.
  const recordActivity = useCallback(() => {
    if (!isLoggedIn || isLocked) return;
    armIdle();
  }, [isLoggedIn, isLocked, armIdle]);

  const checkAndPossiblyLock = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLocked(false);
      setIsChecking(false);
      return;
    }

    try {
      const enabled = await isBiometricEnabled();
      setIsLocked(!!enabled);
    } catch (e) {
      console.log("Biometric check error:", e);
      setIsLocked(false);
    } finally {
      setIsChecking(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    checkAndPossiblyLock();
    armIdle();

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
          nextAppState === "active"
        ) {
          if (shouldLockOnActive.current && isLoggedIn) {
            const enabled = await isBiometricEnabled();
            if (enabled) setIsLocked(true);
          }
          shouldLockOnActive.current = false;
          armIdle();
        }

        appState.current = nextAppState;
      }
    );

    // CHANGE: Expo web does not reliably fire AppState. Listen for real input.
    let removeWeb: (() => void) | undefined;
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const onInput = () => recordActivity();
      window.addEventListener("pointerdown", onInput);
      window.addEventListener("keydown", onInput);
      removeWeb = () => {
        window.removeEventListener("pointerdown", onInput);
        window.removeEventListener("keydown", onInput);
      };
    }

    return () => {
      subscription.remove();
      removeWeb?.();
      clearIdle();
    };
  }, [isLoggedIn, checkAndPossiblyLock, armIdle, recordActivity]);

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const result = await authenticateWithBiometrics("Unlock Payhost");
    if (result.success) {
      setIsLocked(false);
      armIdle();
      return true;
    }
    return false;
  };

  const unlockManually = () => {
    setIsLocked(false);
    armIdle();
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