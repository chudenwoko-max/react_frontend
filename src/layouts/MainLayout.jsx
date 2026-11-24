import { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import useIdleLogout from "../hooks/useIdleLogout";

export default function MainLayout() {
  useIdleLogout();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("[data-menu-button]")
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [sidebarOpen]);

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f7f9fc" }}>
      {/* Pass the ref directly to Sidebar, not a wrapper div */}
      <Sidebar
        ref={sidebarRef} // <--- ADD THIS
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
        {/* ... rest of your layout ... */}
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