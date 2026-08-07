import { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

export default function Savings() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [addAmount, setAddAmount] = useState("");

  // Create form
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await axiosClient.get("/savings/");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount) {
      toast.error("Title and target amount are required");
      return;
    }

    setCreating(true);
    try {
      await axiosClient.post("/savings/create/", {
        title,
        target_amount: targetAmount,
        deadline: deadline || null,
      });
      toast.success("Savings goal created!");
      setTitle("");
      setTargetAmount("");
      setDeadline("");
      setShowCreate(false);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create goal");
    } finally {
      setCreating(false);
    }
  };

  const handleAddMoney = async (goalId) => {
    if (!addAmount || Number(addAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      const res = await axiosClient.post(`/savings/${goalId}/add/`, {
        amount: addAmount,
      });
      toast.success(res.data.message);
      setAddAmount("");
      setSelectedGoal(null);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add money");
    }
  };

  const handleBreakGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to break this goal? Money will be returned to your wallet.")) {
      return;
    }

    try {
      const res = await axiosClient.post(`/savings/${goalId}/break/`);
      toast.success(res.data.message);
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to break goal");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Savings Goals</h1>
          <p style={styles.subtitle}>Lock money and reach your targets</p>
        </div>
        <button onClick={() => setShowCreate(true)} style={styles.createBtn}>
          + New Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {showCreate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Create Savings Goal</h2>
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Goal Title</label>
                <input
                  type="text"
                  placeholder="e.g. New Laptop, Emergency Fund"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Amount (₦)</label>
                <input
                  type="number"
                  placeholder="500000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Deadline (optional)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" disabled={creating} style={styles.primaryBtn}>
                  {creating ? "Creating..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#6b7280" }}>Loading goals...</p>
      ) : goals.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No savings goals yet</p>
          <p style={{ color: "#6b7280" }}>Create your first goal and start saving</p>
        </div>
      ) : (
        <div style={styles.goalsGrid}>
          {goals.map((goal) => (
            <div key={goal.id} style={styles.goalCard}>
              <div style={styles.goalHeader}>
                <h3 style={styles.goalTitle}>{goal.title}</h3>
                <span
                  style={{
                    ...styles.statusBadge,
                    background:
                      goal.status === "completed"
                        ? "#dcfce7"
                        : goal.status === "broken"
                        ? "#fee2e2"
                        : "#dbeafe",
                    color:
                      goal.status === "completed"
                        ? "#16a34a"
                        : goal.status === "broken"
                        ? "#dc2626"
                        : "#2563eb",
                  }}
                >
                  {goal.status}
                </span>
              </div>

              <div style={styles.amounts}>
                <span style={styles.current}>
                  ₦{Number(goal.current_amount).toLocaleString()}
                </span>
                <span style={styles.target}>
                  of ₦{Number(goal.target_amount).toLocaleString()}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${goal.progress}%`,
                    background:
                      goal.status === "completed" ? "#16a34a" : "#2563eb",
                  }}
                />
              </div>
              <p style={styles.progressText}>{goal.progress}% completed</p>

              {goal.deadline && (
                <p style={styles.deadline}>
                  Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}

              {goal.status === "active" && (
                <div style={styles.actions}>
                  <button
                    onClick={() => setSelectedGoal(goal)}
                    style={styles.addBtn}
                  >
                    Add Money
                  </button>
                  <button
                    onClick={() => handleBreakGoal(goal.id)}
                    style={styles.breakBtn}
                  >
                    Break Goal
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Money Modal */}
      {selectedGoal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={{ marginTop: 0 }}>Add to “{selectedGoal.title}”</h2>
            <p style={{ color: "#6b7280", marginBottom: 16 }}>
              Current: ₦{Number(selectedGoal.current_amount).toLocaleString()} / 
              ₦{Number(selectedGoal.target_amount).toLocaleString()}
            </p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Amount to add (₦)</label>
              <input
                type="number"
                placeholder="10000"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => {
                  setSelectedGoal(null);
                  setAddAmount("");
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddMoney(selectedGoal.id)}
                style={styles.primaryBtn}
              >
                Add Money
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= STYLES =================
const styles = {
  page: {
    padding: "32px 28px",
    maxWidth: 900,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
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
  createBtn: {
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  goalsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  goalCard: {
    background: "white",
    borderRadius: 16,
    padding: "22px",
    border: "1px solid #f3f4f6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  goalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  goalTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 600,
    color: "#111827",
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    textTransform: "capitalize",
  },
  amounts: {
    marginBottom: 12,
  },
  current: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
  },
  target: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  progressBar: {
    height: 8,
    background: "#f3f4f6",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 6,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: 12,
    color: "#6b7280",
    margin: "0 0 8px 0",
  },
  deadline: {
    fontSize: 12,
    color: "#9ca3af",
    margin: "0 0 16px 0",
  },
  actions: {
    display: "flex",
    gap: 10,
  },
  addBtn: {
    flex: 1,
    padding: "9px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
  },
  breakBtn: {
    padding: "9px 14px",
    background: "white",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: 8,
    fontWeight: 500,
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: 16,
    border: "1px solid #f3f4f6",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    borderRadius: 16,
    padding: "28px",
    width: "90%",
    maxWidth: 420,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    fontSize: 15,
    outline: "none",
  },
  primaryBtn: {
    flex: 1,
    padding: "11px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    padding: "11px",
    background: "white",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontWeight: 500,
    cursor: "pointer",
  },
};