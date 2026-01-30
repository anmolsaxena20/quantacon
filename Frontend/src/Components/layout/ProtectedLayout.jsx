import { Navigate, Outlet } from "react-router-dom";
import  useAuth  from "@/Context/AuthContext";

export default function ProtectedRoute() {
  const { user, authLoading } = useAuth();

  // ⏳ IMPORTANT: wait for auth check
  if (authLoading) {
    return null; // or spinner
  }

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in
  return <Outlet />;
}
