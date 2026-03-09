import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Clock, Bell, Shield, Smartphone, Users, Zap, BarChart3, Trophy, Navigation, Rocket } from "lucide-react";
import heroBusImage from "@/assets/hero-bus.jpg";

interface HomePageProps {
  onViewChange: (view: string) => void;
}

const HomePage = ({ onViewChange }: HomePageProps) => {
  const features = [
    {
      icon: MapPin,
      title: "Real-time GPS Tracking",
      description: "Track your college bus in real-time with precise GPS location updates every few seconds.",
    },
    {
      icon: Clock,
      title: "ETA Predictions",
      description: "Get accurate arrival time estimates for each bus stop based on current traffic conditions.",
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Receive alerts for delays, breakdowns, route changes, and when your bus is approaching.",
    },
    {
      icon: Shield,
      title: "Admin Dashboard",
      description: "Comprehensive monitoring tools for college authorities to manage the entire bus fleet.",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access from any device - responsive design works perfectly on phones, tablets, and desktops.",
    },
    {
      icon: Users,
      title: "Multi-user Support",
      description: "Separate interfaces for students, drivers, and administrators with role-based access.",
    },
  ];

  const stats = [
    { label: "Active Buses", value: "12", color: "info" },
    { label: "Students Served", value: "1,247", color: "success" },
    { label: "Routes Covered", value: "8", color: "accent" },
    { label: "Avg Response Time", value: "2.3s", color: "warning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-secondary/50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  Live Tracking System
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Smart College
                  </span>
                  <br />
                  Bus Tracking
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Never miss your bus again. Track real-time locations, get accurate ETAs, and receive 
                  instant notifications for all campus transportation.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="hero" 
                  size="lg"
                  onClick={() => onViewChange("student")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <MapPin className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Track My Bus</div>
                    <div className="text-sm opacity-80">Real-time tracking</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onViewChange("admin")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <Shield className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Admin Dashboard</div>
                    <div className="text-sm opacity-80">Management tools</div>
                  </div>
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => onViewChange("test")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <MapPin className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Test Mapbox</div>
                    <div className="text-sm opacity-80">Interactive map</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onViewChange("analytics")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <BarChart3 className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">AI Analytics</div>
                    <div className="text-sm opacity-80">Smart insights</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onViewChange("gamification")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <Trophy className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Gamification</div>
                    <div className="text-sm opacity-80">Earn rewards</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onViewChange("route-optimizer")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <Navigation className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Route Optimizer</div>
                    <div className="text-sm opacity-80">Smart planning</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onViewChange("notifications")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2"
                >
                  <Bell className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Notifications</div>
                    <div className="text-sm opacity-80">Real-time alerts</div>
                  </div>
                </Button>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={() => onViewChange("features")}
                  className="text-lg px-8 py-6 h-auto flex-col gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Rocket className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">All Features</div>
                    <div className="text-sm opacity-80">Complete showcase</div>
                  </div>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold text-${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-20 transform rotate-6"></div>
              <img 
                src={heroBusImage} 
                alt="Modern College Bus" 
                className="relative z-10 w-full h-auto rounded-3xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need for
              <span className="bg-gradient-primary bg-clip-text text-transparent"> smart transportation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive bus tracking system provides real-time insights and seamless communication 
              between students, drivers, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-gradient-card">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="bg-gradient-hero text-primary-foreground shadow-elegant">
            <CardContent className="p-12 text-center">
              <Zap className="h-16 w-16 mx-auto mb-6 text-primary-foreground" />
              <h3 className="text-3xl font-bold mb-4">
                Ready to transform your campus transportation?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of students who never miss their bus anymore.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => onViewChange("student")}
                  className="text-lg px-8 py-6"
                >
                  Start Tracking
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomePage;