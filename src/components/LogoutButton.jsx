import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton({ children, style }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogout = async () => {
    try {
      await axiosClient.post("logout/");
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      localStorage.removeItem("HAS_PIN");
      navigate("/login");
    }
  };

  return (
    <button onClick={handleLogout} style={style}>
      {children || "Log out"}
    </button>
  );
}