import { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import KYCTier1 from "./KYCTier1";
import KYCTier2 from "./KYCTier2";
import KYCTier3 from "./KYCTier3";
import KYCFullyVerified from "./KYCFullyVerified";

const TIER_INFO = {
  "1": { title: "Tier 1", daily: "₦50,000", perTx: "₦50,000", balance: "₦300,000", desc: "Basic verification" },
  "2": { title: "Tier 2", daily: "₦200,000", perTx: "₦200,000", balance: "₦500,000", desc: "Full identity + address" },
  "3": { title: "Tier 3", daily: "₦5,000,000", perTx: "₦1,000,000", balance: "Unlimited", desc: "Enhanced verification" },
};

export default function KYC() {
  const [status, setStatus] = useState("");
  const [limits, setLimits] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [backendHasBvn, setBackendHasBvn] = useState(false);
  const [backendHasNin, setBackendHasNin] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);

  const isApproved = ["approved", "verified"].includes((status || "").toLowerCase());
  const isPending = (status || "").toLowerCase() === "pending";

  // Backend sometimes returns 0 / null after Tier 1 approval.
  // Treat any approved user with tier < 1 as Tier 1.
  const rawTier = Number(limits?.tier || 0);
  const currentTier = isApproved ? Math.max(rawTier, 1) : rawTier;

  const isFullyVerified = isApproved && !isPending && currentTier >= 3;

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      setFetching(true);
      setError("");
      try {
        const { data } = await axiosClient.get("kyc/");
        if (!active) return;
        setStatus(data.status || "");
        setLimits(data.limits || null);
        setBackendHasBvn(!!data.bvn);
        setBackendHasNin(!!data.nin);
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message || "Could not load KYC status.");
      } finally {
        if (active) setFetching(false);
      }
    };
    fetchStatus();
    return () => { active = false; };
  }, []);

  // Decide what to show
  let mode = "loading";
  let displayTier = "1";

  if (isPending) {
    mode = "pending";
    displayTier = String(currentTier || 1);
  } else if (isFullyVerified) {
    mode = "fullyVerified";
    displayTier = "3";
  } else if (isApproved && !showUpgradeForm) {
    // Stable status screen – never auto-jump
    mode = "tierStatus";
    displayTier = String(currentTier); // already >= 1 when approved
  } else if (!isApproved) {
    mode = "form";
    displayTier = "1";
  } else if (currentTier < 2) {
    // Approved at Tier 1 → show Tier 2 form
    mode = "form";
    displayTier = "2";
  } else {
    // Approved at Tier 2 → show Tier 3 form
    mode = "form";
    displayTier = "3";
  }

  const tierInfo = TIER_INFO[displayTier] || TIER_INFO["1"];

  if (fetching) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading KYC status…</div>;
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 24 }}>
      <h1 style={{ fontFamily: "serif", fontSize: 26, marginBottom: 12 }}>Get Verified</h1>

      <div style={{ background: "#eff6ff", padding: 14, borderRadius: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e40af" }}>{tierInfo.title}</div>
        <div style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{tierInfo.desc}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 6 }}>
          Daily: {tierInfo.daily} · Per transaction: {tierInfo.perTx}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
          Balance limit: {tierInfo.balance}
        </div>
      </div>

      {status && <p style={{ color: "#475569" }}>Status: {status.toUpperCase()}</p>}

      {mode === "fullyVerified" && <KYCFullyVerified />}

      {mode === "pending" && (
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <p style={{ color: "#92400e", fontWeight: 600 }}>Under review</p>
          <p style={{ color: "#64748B" }}>Your documents have been submitted and are awaiting approval.</p>
        </div>
      )}

      {mode === "tierStatus" && (
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <p style={{ color: "#166534", fontWeight: 600, fontSize: 16 }}>
            You are verified at {tierInfo.title}
          </p>
          <p style={{ color: "#64748B", marginTop: 8, marginBottom: 24 }}>
            You can continue using your account with the limits shown above, or upgrade for higher limits.
          </p>
          {currentTier < 3 && (
            <button
              type="button"
              onClick={() => setShowUpgradeForm(true)}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Upgrade to Tier {currentTier + 1}
            </button>
          )}
        </div>
      )}

      {mode === "form" && displayTier === "1" && <KYCTier1 />}
      {mode === "form" && displayTier === "2" && (
        <KYCTier2 backendHasBvn={backendHasBvn} backendHasNin={backendHasNin} />
      )}
      {mode === "form" && displayTier === "3" && <KYCTier3 />}

      {error && <p style={{ color: "#B91C1C", marginTop: 12 }}>{error}</p>}
    </div>
  );
}