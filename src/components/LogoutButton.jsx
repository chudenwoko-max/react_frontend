import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");

    // Force redirect to login
    navigate("/login", { replace: true });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "8px 14px",
        background: "#dc3545",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Logout
    </button>
  );
}

export default LogoutButton;
