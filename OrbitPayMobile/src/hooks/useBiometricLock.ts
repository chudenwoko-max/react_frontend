import { useEffect, useRef, useState, useCallback } from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  isBiometricEnabled,
  authenticateWithBiometrics,
} from "../utils/biometric";

export function useBiometricLock(isLoggedIn: boolean) {
  const [isLocked, setIsLocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const appState = useRef(AppState.currentState);
  const shouldLockOnActive = useRef(false);

  const checkAndPossiblyLock = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLocked(false);
      setIsChecking(false);
      return;
    }

    try {
      const enabled = await isBiometricEnabled();
      if (enabled) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      console.log("Biometric check error:", e);
      setIsLocked(false);
    } finally {
      setIsChecking(false);
    }
  }, [isLoggedIn]);

  // Initial check + AppState listener
  useEffect(() => {
    checkAndPossiblyLock();

    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState: AppStateStatus) => {
        // Going to background / inactive
        if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          shouldLockOnActive.current = true;
        }

        // Coming back to active
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          if (shouldLockOnActive.current && isLoggedIn) {
            const enabled = await isBiometricEnabled();
            if (enabled) {
              setIsLocked(true);
            }
          }
          shouldLockOnActive.current = false;
        }

        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [isLoggedIn, checkAndPossiblyLock]);

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const result = await authenticateWithBiometrics("Unlock OrbitPay");
    if (result.success) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const unlockManually = () => {
    // Call this after successful PIN entry
    setIsLocked(false);
  };

  return {
    isLocked,
    isChecking,
    unlockWithBiometrics,
    unlockManually,
    setIsLocked, // rarely needed
  };
}