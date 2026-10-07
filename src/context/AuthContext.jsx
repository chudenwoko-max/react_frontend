import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient
      .get("profile/")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    try {
      await axiosClient.post("logout/");
    } catch {
      // Cookie may already be gone.
    }
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}