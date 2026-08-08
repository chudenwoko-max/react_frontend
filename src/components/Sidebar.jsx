import { NavLink } from "react-router-dom";
import {
  FaHome, FaWallet, FaPaperPlane, FaMoneyBill, FaArrowDown,
  FaExchangeAlt, FaUser, FaImage, FaUniversity, FaShieldAlt,
  FaHandHoldingUsd, FaPiggyBank, FaCreditCard, FaUserFriends,
  FaClock, FaHeadset, FaFileAlt, FaMobileAlt, FaTimes
} from "react-icons/fa";

export default function Sidebar({ isOpen, onClose }) {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FaHome /> },
    { path: "/wallet", label: "Wallet", icon: <FaWallet /> },
    { path: "/send-money", label: "Send Money", icon: <FaPaperPlane /> },
    { path: "/request-money", label: "Request Money", icon: <FaHandHoldingUsd /> },
    { path: "/fund-wallet", label: "Fund Wallet", icon: <FaMoneyBill /> },
    { path: "/withdraw", label: "Withdraw", icon: <FaArrowDown /> },
    { path: "/transactions", label: "Transactions", icon: <FaExchangeAlt /> },
    { path: "/converter", label: "Currency Converter", icon: <FaExchangeAlt /> },
    { path: "/kyc", label: "Verify Identity", icon: <FaShieldAlt /> },
    { path: "/profile", label: "Profile", icon: <FaUser /> },
    { path: "/avatar-upload", label: "Avatar Upload", icon: <FaImage /> },
    { path: "/bank-account", label: "Bank Account", icon: <FaUniversity /> },
    { path: "/bills", label: "Bill Payments", icon: <FaMobileAlt /> },
    { path: "/savings", label: "Savings Goals", icon: <FaPiggyBank /> },
    { path: "/cards", label: "Virtual Cards", icon: <FaCreditCard /> },
    { path: "/referral", label: "Refer & Earn", icon: <FaUserFriends /> },
    { path: "/scheduled", label: "Scheduled", icon: <FaClock /> },
    { path: "/support", label: "Help & Support", icon: <FaHeadset /> },
    { path: "/statements", label: "Statements", icon: <FaFileAlt /> },
  ];

  return (
    <div
      style={{
        ...styles.sidebar,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }}
      className="sidebar"
    >
      {/* Close button for mobile */}
      <button onClick={onClose} style={styles.closeBtn}>
        <FaTimes size={18} />
      </button>

      {/* Brand */}
      <div style={styles.brand}>
        <img src="/orbitpay-logo.png" alt="OrbitPay" style={styles.logo} />
      </div>

      {/* Menu */}
      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.activeLink : {}),
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 50,
    transition: "transform 0.3s ease",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#64748b",
    display: "block",
  },
  brand: {
    padding: "24px 20px",
    borderBottom: "1px solid #f3f4f6",
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: 76,
    objectFit: "contain",
  },
  nav: {
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    overflowY: "auto",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
    borderRadius: 10,
    textDecoration: "none",
    color: "#4b5563",
    fontSize: 14,
    fontWeight: 500,
  },
  activeLink: {
    background: "#f1f5f9",
    color: "#0F172A",
    fontWeight: 600,
  },
  icon: {
    fontSize: 16,
    width: 20,
    display: "flex",
    justifyContent: "center",
  },
};