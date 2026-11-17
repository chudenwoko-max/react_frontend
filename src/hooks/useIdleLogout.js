import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";

const IDLE_MS = 5 * 60 * 1000; // 5 minutes

export default function useIdleLogout() {
  const navigate = useNavigate();
  const timer = useRef(null);

  const logout = async () => {
    try {
      await axiosClient.post("logout/");
    } catch (_) {}
    localStorage.removeItem("payhost_username");
    navigate("/login", { replace: true });
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(logout, IDLE_MS);
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
}