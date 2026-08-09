import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

 return (
  <div style={{ display: "flex", height: "100vh", background: "#F8FAFC" }}>
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
      <Navbar
        isSidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((prev) => !prev)}
      />

      <main style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#F8FAFC" }}>
        <Outlet />
      </main>
    </div>
  </div>
);
}