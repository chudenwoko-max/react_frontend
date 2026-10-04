import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar({ isSidebarOpen, onMenuClick }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        borderBottom: "1px solid #E2E8F0",
        background: "#ffffff",
      }}
    >
      {/* Left — menu button only */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            lineHeight: 1,
            padding: 4,
          }}
          className="menu-tip"
          data-tip={isSidebarOpen ? "Close menu" : "Open menu"}
          aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
        >
          {isSidebarOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Removed duplicate navbar logo */}
      </div>

      {/* Right — user info */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={
              window.user?.avatar ||
              `https://ui-avatars.com/api/?name=${window.user?.username || "User"}&background=e5e7eb&color=374151`
            }
            alt="avatar"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <span style={{ fontSize: 15, color: "#374151" }}>
            {window.user?.username || "User"}
          </span>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("ACCESS_TOKEN");
            localStorage.removeItem("REFRESH_TOKEN");
            window.location.href = "/login";
          }}
          style={{
            padding: "8px 14px",
            background: "#0F172A",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Logout
        </button>
      </div>
    </header>
  );
}
