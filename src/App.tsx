import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import StudentDashboard from "@/components/StudentDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import DriverDashboard from "@/components/DriverDashboard";
import NotificationCenter from "@/components/NotificationCenter";
import InstallPrompt from "@/components/InstallPrompt";
import GamificationDashboard from "@/components/GamificationDashboard";
import SmartRouteOptimizer from "@/components/SmartRouteOptimizer";
import AIAnalyticsDashboard from "@/components/AIAnalyticsDashboard";
import TestMap from "@/pages/TestMap";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/components/NotificationSystem";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <InstallPrompt />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Student Routes */}
              <Route
                path="/dashboard/student"
                element={
                  <ProtectedRoute roles={["student"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="analytics" element={<AIAnalyticsDashboard />} />
                <Route path="route-optimizer" element={<SmartRouteOptimizer />} />
                <Route path="alerts" element={<NotificationCenter />} />
              </Route>

              {/* Protected Driver Routes */}
              <Route
                path="/dashboard/driver"
                element={
                  <ProtectedRoute roles={["driver"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DriverDashboard />} />
                <Route path="alerts" element={<NotificationCenter />} />
              </Route>

              {/* Protected Admin Routes */}
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute roles={["admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="analytics" element={<AIAnalyticsDashboard />} />
                <Route path="route-optimizer" element={<SmartRouteOptimizer />} />
                <Route path="alerts" element={<NotificationCenter />} />
              </Route>

              {/* Global Feature Routes */}
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute roles={["student", "driver", "admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<NotificationCenter />} />
              </Route>

              <Route
                path="/route-optimizer"
                element={
                  <ProtectedRoute roles={["student", "driver", "admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<SmartRouteOptimizer />} />
              </Route>

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute roles={["student", "driver", "admin"]}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AIAnalyticsDashboard />} />
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
