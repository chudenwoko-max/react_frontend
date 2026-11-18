import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Logout() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await axiosClient.post("logout/");
      } catch (err) {
        console.error(err);
      } finally {
        setUser(null);
        // Clear only non-sensitive items if needed
        localStorage.removeItem("HAS_PIN");
        navigate("/login");
      }
    };
    doLogout();
  }, [navigate, setUser]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Signing out…</p>
    </div>
  );
}