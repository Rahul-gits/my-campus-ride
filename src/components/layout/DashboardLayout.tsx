import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, NotificationBell, NotificationDropdown } from "@/components/NotificationSystem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bus, 
  Bell, 
  Shield, 
  User, 
  Menu, 
  X, 
  LogOut, 
  Wifi, 
  WifiOff, 
  Trophy, 
  Navigation, 
  BarChart3, 
  MapPin, 
  Settings,
  Users
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<any>;
}

const NAVIGATION_CONFIG: Record<"student" | "driver" | "admin", NavItem[]> = {
  student: [
    { label: "Dashboard", path: "/dashboard/student", icon: Bus },
    { label: "AI Analytics", path: "/dashboard/student/analytics", icon: BarChart3 },
    { label: "Route Optimizer", path: "/dashboard/student/route-optimizer", icon: Navigation },
    { label: "Alerts", path: "/dashboard/student/alerts", icon: Bell },
  ],
  driver: [
    { label: "Dashboard", path: "/dashboard/driver", icon: Bus },
    { label: "Alerts", path: "/dashboard/driver/alerts", icon: Bell },
  ],
  admin: [
    { label: "Dashboard", path: "/dashboard/admin", icon: Bus },
    { label: "AI Analytics", path: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Route Optimizer", path: "/dashboard/admin/route-optimizer", icon: Navigation },
    { label: "Alerts", path: "/dashboard/admin/alerts", icon: Bell },
  ]
};

const THEME_CONFIG = {
  student: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500",
    border: "border-emerald-500/20",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
    activeBg: "bg-emerald-500 text-white shadow-emerald-500/20",
    accent: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
  },
  driver: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500",
    border: "border-amber-500/20",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    activeBg: "bg-amber-500 text-white shadow-amber-500/20",
    accent: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    badge: "bg-amber-500/10 text-amber-700 border-amber-500/20"
  },
  admin: {
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500",
    border: "border-violet-500/20",
    hoverBg: "hover:bg-violet-50 dark:hover:bg-violet-950/20",
    activeBg: "bg-violet-500 text-white shadow-violet-500/20",
    accent: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    badge: "bg-violet-500/10 text-violet-700 border-violet-500/20"
  }
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const role = user?.role || "student";
  const theme = THEME_CONFIG[role];
  const navItems = NAVIGATION_CONFIG[role];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex">
      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 border-r bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${theme.border}
      `}>
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <Link to="/" className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white shadow-sm border ${theme.border}`}>
              <Bus className={`h-6 w-6 ${theme.color}`} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-950 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              CampusRide
            </span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive 
                    ? `${theme.activeBg} shadow-lg shadow-black/5` 
                    : `text-slate-600 dark:text-slate-400 ${theme.hoverBg} hover:text-slate-900 dark:hover:text-white`
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-white" : ""}`} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-6">
          <div className="p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Logged in as
            </span>
            <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
              {role} Console
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Connectivity Status */}
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold select-none border transition-all duration-300
                ${isOnline 
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-700 border-rose-500/20"
                }
              `}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? "bg-emerald-500" : "bg-rose-500"}`} />
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Dropdown Container */}
            <div className="relative">
              <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} />
              <NotificationDropdown 
                isOpen={showNotificationDropdown} 
                onClose={() => setShowNotificationDropdown(false)} 
              />
            </div>

            {/* Profile Avatar and Name */}
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className={`${theme.accent} font-semibold text-sm`}>
                  {getInitials(user?.username || "")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {user?.username}
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0 h-4 ${theme.badge}`}>
                  {role}
                </Badge>
              </div>
            </div>

            {/* Logout Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
