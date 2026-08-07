import React from "react";

function RecentActivity({ data }) {
  if (!data) return null;

  const getColor = (type) => {
    switch (type) {
      case "fund":
        return "#007bff"; // Blue
      case "transfer":
        return "#28a745"; // Green
      case "withdraw":
        return "#dc3545"; // Red
      default:
        return "#6c757d"; // Grey fallback
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case "fund":
        return "Wallet Funded";
      case "transfer":
        return "Money Sent";
      case "withdraw":
        return "Withdrawal";
      default:
        return type;
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Recent Activity</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((tx, index) => (
          <div
            key={index}
            style={{
              background: "#ffffff",
              padding: "14px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              borderLeft: `6px solid ${getColor(tx.type)}`,
            }}
          >
            <p style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              <span style={{ color: getColor(tx.type) }}>
                ●
              </span>{" "}
              {getLabel(tx.type)}
            </p>

            <p style={{ margin: "4px 0 0 0", fontSize: "15px" }}>
              Amount: <strong>₦{tx.amount}</strong>
            </p>

            <small style={{ color: "#555" }}>{tx.created_at}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
