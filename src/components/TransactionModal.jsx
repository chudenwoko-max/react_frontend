// src/components/TransactionModal.jsx

export default function TransactionModal({ tx, onClose }) {
  if (!tx) return null;

  console.log("MODAL DATA:", tx);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          width: "400px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <h3>Transaction Details</h3>

        <p><strong>Reference:</strong> {tx.reference_id}</p>
        <p><strong>Type:</strong> {tx.type}</p>
        <p><strong>Amount:</strong> ₦{tx.amount}</p>
        <p><strong>Description:</strong> {tx.description || "-"}</p>
        <p><strong>Date:</strong> {new Date(tx.created_at).toLocaleString()}</p>
        <p><strong>User:</strong> {tx.user}</p>
        <p><strong>Category:</strong> {tx.category}</p> {/* ⭐ NEW */}

        <button
          onClick={() => {
            const url = `http://192.168.0.187:8000/api/transactions/${tx.reference_id}/receipt/`;
            window.open(url, "_blank");
          }}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Download Receipt (PDF)
        </button>

        <button
          onClick={onClose}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
