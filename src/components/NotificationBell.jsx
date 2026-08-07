import { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get("/notifications/");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await axiosClient.post(`/notifications/${id}/read/`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.post("/notifications/read-all/");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div style={styles.wrapper} ref={dropdownRef}>
      {/* Bell Button */}
      <button onClick={() => setOpen(!open)} style={styles.bellBtn}>
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <span style={styles.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={styles.markAllBtn}>
                Mark all as read
              </button>
            )}
          </div>

          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    ...styles.item,
                    background: n.is_read ? "white" : "#f0f9ff",
                  }}
                >
                  <div style={styles.itemContent}>
                    <p style={styles.itemTitle}>{n.title}</p>
                    <p style={styles.itemMessage}>{n.message}</p>
                    <p style={styles.itemTime}>{n.created_at}</p>
                  </div>
                  {!n.is_read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  wrapper: {
    position: "relative",
  },
  bellBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: "8px",
    borderRadius: "50%",
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    background: "#ef4444",
    color: "white",
    fontSize: 10,
    fontWeight: 700,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 4px",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: 42,
    width: 360,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    border: "1px solid #e5e7eb",
    zIndex: 1000,
    overflow: "hidden",
  },
  dropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "1px solid #f3f4f6",
  },
  headerTitle: {
    fontWeight: 600,
    fontSize: 15,
    color: "#111827",
  },
  markAllBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
  },
  list: {
    maxHeight: 380,
    overflowY: "auto",
  },
  item: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid #f9fafb",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    margin: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
  },
  itemMessage: {
    margin: "3px 0 0",
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 1.4,
  },
  itemTime: {
    margin: "5px 0 0",
    fontSize: 11,
    color: "#9ca3af",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#2563eb",
    marginTop: 6,
    flexShrink: 0,
  },
  empty: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
};