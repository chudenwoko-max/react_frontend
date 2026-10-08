import { useEffect, useState } from "react";

function part(date) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function Greeting({ name }) {
  const [label, setLabel] = useState(() => part(new Date()));

  useEffect(() => {
    const id = setInterval(() => setLabel(part(new Date())), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const who = (name || "").trim() || "there";

  return (
    <h1 style={{ fontSize: 28, margin: "8px 0 16px" }}>
      {label}, {who}!
    </h1>
  );
}