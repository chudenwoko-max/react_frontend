import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "transparent",
        border: "none",
        color: "red",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "16px",
      }}
    >
      Logout
    </button>
  );
}
