import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const navigate = useNavigate();

  // PATCH: session check is GET profile/ with the cookie, not ACCESS_TOKEN in localStorage.
  // 200 stays signed in. 401 (after the axios refresh retry) means logged out.
  useEffect(() => {
    let gone = false;
    axiosClient
      .get("profile/")
      .then((res) => {
        if (!gone) setUser(res.data?.user || res.data);
      })
      .catch(() => {
        if (!gone) setUser(null);
      });
    return () => {
      gone = true;
    };
  }, []);

  const logout = async () => {
    try {
      // PATCH: server clears payhost_access and payhost_refresh. Do not touch localStorage.
      await axiosClient.post("logout/");
    } catch (e) {
      console.log(e);
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