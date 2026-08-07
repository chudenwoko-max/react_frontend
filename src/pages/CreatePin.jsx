import { useState } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function CreatePin() {
  const [pin, setPin] = useState("");

  const handleCreatePin = async () => {
    if (!pin || pin.length < 4) {
      toast.error("Enter a valid PIN");
      return;
    }

    try {
      const res = await axiosClient.post("/create-pin/", { pin });

      // ⭐ THIS MUST RECEIVE pin_token FROM BACKEND
      localStorage.setItem("PIN_TOKEN", res.data.pin_token);

      toast.success("PIN created successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create PIN");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Transfer PIN</h2>

      <input
        type="password"
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleCreatePin}
        style={{
          width: "100%",
          padding: "12px",
          background: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        Save PIN
      </button>
    </div>
  );
}
