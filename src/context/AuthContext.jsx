import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient"; // ← use your axios client

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const navigate = useNavigate();

  // Load user from token on startup
  useEffect(() => {
    const token = localStorage.getItem("ACCESS_TOKEN");

    if (!token) {
      setUser(null);
      return;
    }

    axiosClient
      .get("profile/")
      .then((res) => {
        setUser(res.data);
      })
      .catch(() => {
        // Token invalid or expired
        localStorage.removeItem("ACCESS_TOKEN");
        localStorage.removeItem("REFRESH_TOKEN");
        setUser(null);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
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