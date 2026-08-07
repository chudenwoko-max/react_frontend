export default function Skeleton({ width = "100%", height = "16px", radius = "6px" }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #e0e0e0, #f5f5f5, #e0e0e0)",
        backgroundSize: "200% 100%",
        animation: "skeleton-loading 1.2s ease-in-out infinite",
      }}
    >
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
