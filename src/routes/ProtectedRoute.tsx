import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export const ProtectedRoute = ({ children, roles }: { children: JSX.Element; roles?: Array<"student" | "driver" | "admin"> }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/dashboard/${user.role}`} replace />;
  return children;
};

export default ProtectedRoute;


