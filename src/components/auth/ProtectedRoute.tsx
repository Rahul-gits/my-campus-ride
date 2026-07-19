import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: Array<"student" | "driver" | "admin">;
}

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Prevent role escalation: if path is restricted and user's role is not allowed,
  // redirect them to their respective role dashboard.
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
