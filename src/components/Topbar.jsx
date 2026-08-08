import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Topbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      {/* Left */}
      <div style={styles.left}>
        <span style={styles.brand}>OrbitPay</span>
      </div>

      {/* Right */}
      <div style={styles.right}>
        <div style={styles.userSection}>
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=e5e7eb&color=374151`
            }
            alt="avatar"
            style={styles.avatar}
          />
          <span style={styles.username}>{user?.username || "User"}</span>
        </div>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;

// ================= STYLES =================
const styles = {
  header: {
    background: "#ffffff",
    height: "64px",
    padding: "0 28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  brand: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    objectFit: "cover",
  },
  username: {
    fontSize: 14,
    fontWeight: 500,
    color: "#374151",
  },
  logoutBtn: {
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};