import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import { FaBars, FaTimes } from "react-icons/fa";

function Navbar({ onMenuClick, isSidebarOpen }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          style={styles.menuBtn}
          className="menu-btn"
          title={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Logo + OrbitPay text (same size, very close) */}
        <div style={styles.brand}>
          <img
            src="/orbitpay-logo.png"
            alt="OrbitPay"
            style={styles.logo}
          />
          <span style={styles.brandText}>OrbitPay</span>
        </div>
      </div>

      <div style={styles.right}>
        <NotificationBell />

        <div style={styles.userInfo}>
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
    </nav>
  );
}

export default Navbar;

const styles = {
  nav: {
    background: "#ffffff",
    height: "64px",
    padding: "0 16px",
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
    gap: "6px", // tight gap like GitHub
  },
  menuBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    color: "#0F172A",
    display: "flex",
    alignItems: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logo: {
    height: 32,          // same visual size as text
    width: 32,
    objectFit: "contain",
  },
  brandText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0F172A",
    letterSpacing: "-0.3px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  userInfo: {
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
    background: "#ffffff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  },
};