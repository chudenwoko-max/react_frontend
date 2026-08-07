export default function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #ddd;
          border-top-color: #007bff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
