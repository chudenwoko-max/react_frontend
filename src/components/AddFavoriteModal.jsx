import { useState } from "react";
import { addFavorite } from "../api/favorites";

export default function AddFavoriteModal({ open, onClose, recipientUsername }) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await addFavorite(recipientUsername, nickname);
      onClose(true); // success
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add favorite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-sm">
        <h2 className="text-sm font-semibold mb-2">Add to Favorites</h2>
        <p className="text-xs mb-3">
          Recipient: <span className="font-medium">{recipientUsername}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs block mb-1">Nickname (optional)</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Mom, Landlord, Chude Savings..."
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="text-xs px-3 py-1 rounded border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="text-xs px-3 py-1 rounded bg-blue-600 text-white"
            >
              {loading ? "Saving..." : "Save Favorite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
