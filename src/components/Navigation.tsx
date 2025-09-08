import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Map, Settings, Users, Bell, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navItems = [
    { id: "home", label: "Home", icon: Bus },
    { id: "student", label: "Track Bus", icon: Map },
    { id: "admin", label: "Admin", icon: Settings },
    { id: "alerts", label: "Alerts", icon: Bell },
  ];

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Bus className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                BusTracker
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm pt-16">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    className="w-full justify-start gap-3"
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Card className="fixed left-4 top-4 bottom-4 w-64 p-4 bg-gradient-card shadow-card z-40">
      <div className="flex items-center gap-2 mb-8">
        <Bus className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          BusTracker
        </h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                activeView === item.id && "shadow-elegant"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-muted-foreground text-center">
          Live College Bus Tracking System
        </div>
      </div>
    </Card>
  );
};

export default Navigation;