import { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";

function part(date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function pickName(user) {
  if (!user) return "";
  return (user.username || user.email?.split("@")[0] || "").trim();
}

export default function Navbar({ isSidebarOpen, onMenuClick }) {
  const { user, setUser } = useAuth();
  const [label, setLabel] = useState(() => part(new Date()));
  const [name, setName] = useState(() => pickName(user));

  useEffect(() => {
    const id = setInterval(() => setLabel(part(new Date())), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const next = pickName(user);
    if (next) setName(next);
  }, [user]);

  useEffect(() => {
    if (pickName(user)) return;
    let gone = false;
    axiosClient
      .get("profile/")
      .then((r) => {
        const profile = r.data?.user || r.data;
        if (!gone && profile) {
          setUser?.(profile);
          setName(pickName(profile));
        }
      })
      .catch((err) => {
        console.error(err.response?.status, err.response?.data);
      });
    return () => {
      gone = true;
    };
  }, [user, setUser]);

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
      <style>{`
        .menu-tip { position: relative; }
        .menu-tip::after {
          content: attr(data-tip);
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #1f2328;
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          z-index: 1000;
        }
        .menu-tip:hover::after { opacity: 1; }
      `}</style>

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
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 15, color: "#0F172A", fontWeight: 600 }}>
          {label}, {name || "there"}!
        </span>

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