import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Login from "./Login";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their correct dashboard immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return <Login />;
};

export default Index;
