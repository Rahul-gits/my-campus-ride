import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Bus, 
  MapPin, 
  Clock, 
  Navigation, 
  Users, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import mapBackgroundImage from "@/assets/map-background.jpg";

const StudentDashboard = () => {
  const [selectedRoute, setSelectedRoute] = useState("Route A");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const routes = [
    { id: "Route A", name: "Campus → Downtown", buses: 2, nextArrival: "3 min" },
    { id: "Route B", name: "Campus → Mall", buses: 1, nextArrival: "7 min" },
    { id: "Route C", name: "Campus → Station", buses: 3, nextArrival: "12 min" },
  ];

  const busData = {
    "Route A": [
      {
        id: "BUS-001",
        driver: "John Smith",
        capacity: 45,
        occupied: 32,
        status: "moving",
        eta: "3 min",
        nextStop: "Main Gate",
        progress: 75,
        location: "Near Library",
      },
      {
        id: "BUS-002", 
        driver: "Sarah Johnson",
        capacity: 45,
        occupied: 28,
        status: "stopped",
        eta: "8 min",
        nextStop: "Cafeteria",
        progress: 45,
        location: "Student Center",
      }
    ]
  };

  const stops = [
    { name: "Main Gate", eta: "3 min", status: "next" },
    { name: "Library", eta: "5 min", status: "upcoming" },
    { name: "Cafeteria", eta: "8 min", status: "upcoming" },
    { name: "Sports Complex", eta: "12 min", status: "upcoming" },
    { name: "Downtown Hub", eta: "18 min", status: "destination" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "moving": return <Navigation className="h-4 w-4 text-success animate-pulse" />;
      case "stopped": return <AlertCircle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving": return "success";
      case "stopped": return "warning";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bus Tracker</h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleTimeString()} • Real-time updates
            </p>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Route Selection */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                Select Route
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {routes.map((route) => (
                <div
                  key={route.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedRoute === route.id 
                      ? 'border-primary bg-primary/5 shadow-elegant' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRoute(route.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{route.id}</h3>
                      <p className="text-sm text-muted-foreground">{route.name}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {route.buses} buses
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-primary font-medium">Next: {route.nextArrival}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Route Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-accent" />
                Route Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stops.map((stop, index) => (
                <div key={stop.name} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    stop.status === 'next' ? 'bg-primary animate-pulse' :
                    stop.status === 'upcoming' ? 'bg-muted-foreground' :
                    'bg-accent'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${
                        stop.status === 'next' ? 'font-semibold text-primary' : 'text-muted-foreground'
                      }`}>
                        {stop.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{stop.eta}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Tracking Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Placeholder */}
          <Card className="overflow-hidden">
            <div className="relative h-80 bg-gradient-to-br from-primary/10 to-accent/10">
              <img 
                src={mapBackgroundImage} 
                alt="Route Map" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 shadow-card">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-center mb-2">Interactive Map</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">
                    Real-time bus positions and route visualization will be displayed here
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Active Buses */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Active Buses on {selectedRoute}
            </h2>
            
            {busData[selectedRoute as keyof typeof busData]?.map((bus) => (
              <Card key={bus.id} className="hover:shadow-elegant transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-primary">
                        <Bus className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{bus.id}</CardTitle>
                        <CardDescription>Driver: {bus.driver}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(bus.status) as any} className="flex items-center gap-1">
                      {getStatusIcon(bus.status)}
                      {bus.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">ETA</div>
                      <div className="font-semibold text-primary text-lg">{bus.eta}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Next Stop</div>
                      <div className="font-medium">{bus.nextStop}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Location</div>
                      <div className="font-medium">{bus.location}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Occupancy</div>
                      <div className="font-medium">{bus.occupied}/{bus.capacity}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Route Progress</span>
                      <span>{bus.progress}%</span>
                    </div>
                    <Progress value={bus.progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {Math.round((bus.occupied / bus.capacity) * 100)}% full
                    </span>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      Track <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;