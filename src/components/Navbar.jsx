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
      {/* Left side - Menu button */}
      <div style={styles.left}>
        <button
          onClick={onMenuClick}
          style={styles.menuBtn}
          className="menu-btn"
          title={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </div>

      {/* Right side */}
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
    padding: "0 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #e5e7eb",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  left: {
    display: "flex",
    alignItems: "center",
  },
  menuBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    color: "#0F172A",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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