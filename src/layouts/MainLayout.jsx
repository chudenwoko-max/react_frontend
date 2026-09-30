import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  // Always start closed → hamburger shows first
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f7f9fc" }}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          position: "relative",
        }}
      >

        {/* BRAND PATCH — replaces OrbitPay */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <Link to="/dashboard" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/payhost-logo.png"
              alt="Payhost"
              height={56}
              style={{ display: "block" }}
            />
          </Link>
        </div>

        <Navbar
          isSidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
