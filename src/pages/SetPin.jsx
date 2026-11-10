import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PinModal from "../components/PinModal";
import toast from "react-hot-toast";

export default function SetPin() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleVerified = () => {
    toast.success("Transfer PIN set successfully");
    localStorage.setItem("HAS_PIN", "true");
    navigate("/dashboard", { replace: true });
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <PinModal
      open={open}
      onClose={handleClose}
      onVerified={handleVerified}
      mode="set"
    />
  );
}