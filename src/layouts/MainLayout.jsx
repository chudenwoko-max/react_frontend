import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#f7f9fc" }}>
      
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* Add Navbar here */}
        <Navbar />

        {/* Page content */}
        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}
