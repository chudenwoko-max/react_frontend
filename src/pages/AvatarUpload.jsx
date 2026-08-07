import { useState } from "react";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

export default function AvatarUpload() {
  const { user, setUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setLoading(true);

    try {
      const res = await axiosClient.post("user/avatar/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Avatar updated successfully");

      // Update user in context if backend returns new avatar
      if (res.data?.avatar) {
        setUser({ ...user, avatar: res.data.avatar });
      } else {
        window.location.reload();
      }
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Change Avatar</h1>
        <p style={styles.subtitle}>Upload a new profile picture</p>
      </div>

      <div style={styles.card}>
        {/* Current / Preview Avatar */}
        <div style={styles.avatarWrapper}>
          <img
            src={
              preview ||
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.username || "User"}&background=2563eb&color=fff&size=128`
            }
            alt="avatar"
            style={styles.avatar}
          />
        </div>

        {/* File Input */}
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.fileInput}
            id="avatarInput"
          />
          <label htmlFor="avatarInput" style={styles.uploadLabel}>
            {file ? file.name : "Choose an image"}
          </label>
        </div>

        <p style={styles.helper}>
          Recommended: Square image, at least 200×200px (JPG or PNG)
        </p>

        {/* Buttons */}
        <div style={styles.actions}>
          <Link to="/profile" style={styles.secondaryBtn}>
            Cancel
          </Link>
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{
              ...styles.primaryBtn,
              opacity: loading || !file ? 0.6 : 1,
              cursor: loading || !file ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Uploading..." : "Save Avatar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 480,
    margin: "0 auto",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  subtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 14,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "32px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    textAlign: "center",
  },
  avatarWrapper: {
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #e5e7eb",
  },
  uploadBox: {
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    padding: "20px",
    marginBottom: 12,
    background: "#f9fafb",
  },
  fileInput: {
    display: "none",
  },
  uploadLabel: {
    display: "block",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: "#2563eb",
  },
  helper: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 28,
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },
  primaryBtn: {
    background: "#2563eb",
    color: "white",
    padding: "11px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    border: "none",
  },
  secondaryBtn: {
    background: "white",
    color: "#374151",
    padding: "11px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid #d1d5db",
  },
};