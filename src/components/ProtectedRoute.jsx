import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // AuthProvider not ready yet
  if (user === undefined) {
    return null;
  }

  // User logged out
  if (user === null) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
