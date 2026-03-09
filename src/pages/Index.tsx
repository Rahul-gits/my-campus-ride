import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Navigation from "@/components/Navigation";
import HomePage from "@/components/HomePage";
import StudentDashboard from "@/components/StudentDashboard";
import AdminDashboard from "@/components/AdminDashboard";
import TestMap from "@/pages/TestMap";
import AIAnalyticsDashboard from "@/components/AIAnalyticsDashboard";
import GamificationDashboard from "@/components/GamificationDashboard";
import SmartRouteOptimizer from "@/components/SmartRouteOptimizer";
import NotificationCenter from "@/components/NotificationCenter";
import FeaturesShowcase from "@/components/FeaturesShowcase";

const Index = () => {
  const [activeView, setActiveView] = useState("home");
  const isMobile = useIsMobile();

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <HomePage onViewChange={setActiveView} />;
      case "student":
        return <StudentDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "test":
        return <TestMap />;
      case "analytics":
        return <AIAnalyticsDashboard />;
      case "gamification":
        return <GamificationDashboard />;
      case "route-optimizer":
        return <SmartRouteOptimizer />;
      case "notifications":
        return <NotificationCenter />;
      case "features":
        return <FeaturesShowcase />;
      case "alerts":
        return (
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Notifications & Alerts</h1>
            <p className="text-muted-foreground">Alert management system coming soon...</p>
          </div>
        );
      default:
        return <HomePage onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      <main className={`${isMobile ? 'pt-16' : 'ml-72'} min-h-screen`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
