import { useEffect } from "react";

export default function Logout() {
  useEffect(() => {
    // Clear all tokens
    localStorage.removeItem("ACCESS_TOKEN");
    localStorage.removeItem("REFRESH_TOKEN");
    localStorage.removeItem("PIN_TOKEN");

    // Redirect to login
    window.location.href = "/login";
  }, []);

  return <p>Logging out...</p>;
}
