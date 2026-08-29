import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { DeviceEventEmitter } from "react-native";
import { API_REACHABLE, API_UNREACHABLE } from "../api/axiosClient";

type Connectivity = {
  isOffline: boolean;
  apiUnreachable: boolean;
  showBanner: boolean;
  setApiUnreachable: (value: boolean) => void;
};

const ConnectivityContext = createContext<Connectivity>({
  isOffline: false,
  apiUnreachable: false,
  showBanner: false,
  setApiUnreachable: () => {},
});

export function ConnectivityProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [apiUnreachable, setApiUnreachable] = useState(false);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      if (!offline) setApiUnreachable(false);
    });
    return () => unsub();
  }, []);

    useEffect(() => {
    const down = DeviceEventEmitter.addListener(API_UNREACHABLE, () => setApiUnreachable(true));
    const up = DeviceEventEmitter.addListener(API_REACHABLE, () => setApiUnreachable(false));
    return () => {
      down.remove();
      up.remove();
    };
  }, []);

  const value = useMemo(
    () => ({
      isOffline,
      apiUnreachable,
      showBanner: isOffline || apiUnreachable,
      setApiUnreachable,
    }),
    [isOffline, apiUnreachable]
  );

  return (
    <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>
  );
}

export const useConnectivity = () => useContext(ConnectivityContext);