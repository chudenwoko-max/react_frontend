import { useEffect, useState } from "react";
import { getFavorites, removeFavorite } from "../api/favorites";

function getColorFromString(str) {
  const colors = ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c"];
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i);
  return colors[sum % colors.length];
}

export default function FavoriteRecipients({ onSelect }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    getFavorites()
      .then((res) => {
        if (mounted) {
          setFavorites(res.data);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (id) => {
    await removeFavorite(id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  if (loading) {
    return (
      <div className="mb-4">
        <p className="text-sm font-semibold mb-2">Favorite Recipients</p>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!favorites.length) return null;

  return (
    <div className="mb-4">
      <p className="text-sm font-semibold mb-2">Favorite Recipients</p>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {favorites.map((fav) => {
          const label = fav.nickname || fav.recipient_username;
          const initials = fav.initials || label[0].toUpperCase();
          const color = getColorFromString(label);

          return (
            <div
              key={fav.id}
              className="flex flex-col items-center min-w-[72px]"
            >
              <button
                onClick={() =>
                  onSelect({
                    username: fav.recipient_username,
                    email: fav.recipient_email,
                    avatar: fav.recipient_avatar,
                  })
                }
                className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold"
                style={{
                  backgroundColor: fav.recipient_avatar ? "transparent" : color,
                  overflow: "hidden",
                }}
              >
                {fav.recipient_avatar ? (
                  <img
                    src={fav.recipient_avatar}
                    alt={label}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              <p className="text-xs mt-1 text-center truncate max-w-[72px]">
                {fav.nickname || fav.recipient_username}
              </p>

              <button
                onClick={() => handleRemove(fav.id)}
                className="mt-1 text-[10px] text-red-500"
              >
                remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
