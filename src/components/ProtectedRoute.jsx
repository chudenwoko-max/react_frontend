import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import axiosClient from "../axiosClient";
import UnlockWallet from "./UnlockWallet";

export default function ProtectedRoute({ children }) {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  // CHANGE: legal pages are public
  const publicPaths = ["/privacy", "/terms"];
  if (publicPaths.includes(location.pathname)) {
    return children;
  }

  const handleWalletUnlocked = async () => {
    if (refreshingProfile) return;
    setRefreshingProfile(true);
    try {
      const response = await axiosClient.get("profile/");
      setUser(response.data);
      if (!response.data?.is_frozen) {
        localStorage.removeItem("WALLET_FROZEN");
        navigate("/dashboard", { replace: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Wallet unlocked; sign-in is required:", error);
      localStorage.removeItem("WALLET_FROZEN");
      setUser(null);
      navigate("/login", { replace: true });
      return true;
    } finally {
      setRefreshingProfile(false);
    }
  };

  // AuthProvider not ready yet
  if (user === undefined) {
    return null;
  }

  // User logged out
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  if (user?.is_frozen) {
    return (
      <UnlockWallet
        onUnlocked={handleWalletUnlocked}
        profileRefreshing={refreshingProfile}
      />
    );
  }

  return children;
}