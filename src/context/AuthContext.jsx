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
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setUser(null);
          return;
        }
        console.error("Could not verify the current session:", err);
      });
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