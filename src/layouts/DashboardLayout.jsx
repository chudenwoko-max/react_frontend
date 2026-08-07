import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f7f9fc" }}>
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
