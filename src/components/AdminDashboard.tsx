import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bus, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Shield,
  Bell
} from "lucide-react";

const AdminDashboard = () => {
  const [selectedBus, setSelectedBus] = useState<string | null>(null);

  const fleetData = [
    {
      id: "BUS-001",
      route: "Route A",
      driver: "John Smith",
      status: "active",
      location: "Near Library",
      passengers: 32,
      capacity: 45,
      lastUpdate: "2 min ago",
      fuelLevel: 85,
      speed: 25,
      nextMaintenance: "3 days",
    },
    {
      id: "BUS-002", 
      route: "Route A",
      driver: "Sarah Johnson",
      status: "stopped",
      location: "Student Center",
      passengers: 28,
      capacity: 45,
      lastUpdate: "1 min ago",
      fuelLevel: 62,
      speed: 0,
      nextMaintenance: "1 week",
    },
    {
      id: "BUS-003",
      route: "Route B", 
      driver: "Mike Wilson",
      status: "maintenance",
      location: "Depot",
      passengers: 0,
      capacity: 45,
      lastUpdate: "30 min ago",
      fuelLevel: 95,
      speed: 0,
      nextMaintenance: "Today",
    },
    {
      id: "BUS-004",
      route: "Route C",
      driver: "Emma Davis",
      status: "active",
      location: "Sports Complex",
      passengers: 41,
      capacity: 45,
      lastUpdate: "1 min ago",
      fuelLevel: 78,
      speed: 30,
      nextMaintenance: "5 days",
    },
  ];

  const alerts = [
    { id: 1, type: "warning", message: "BUS-003 scheduled for maintenance", time: "5 min ago" },
    { id: 2, type: "info", message: "Route B experiencing minor delays", time: "12 min ago" },
    { id: 3, type: "success", message: "All buses reported in for morning shift", time: "1 hour ago" },
  ];

  const stats = [
    { label: "Active Buses", value: "11/12", trend: "+2%", icon: Bus, color: "success" },
    { label: "Total Passengers", value: "1,247", trend: "+8%", icon: Users, color: "info" },
    { label: "Routes Covered", value: "8", trend: "0%", icon: MapPin, color: "accent" },
    { label: "Alerts Today", value: "3", trend: "-25%", icon: AlertTriangle, color: "warning" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-success" />;
      case "stopped": return <Clock className="h-4 w-4 text-warning" />;
      case "maintenance": return <Settings className="h-4 w-4 text-destructive" />;
      default: return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "success";
      case "stopped": return "warning";
      case "maintenance": return "destructive";
      default: return "secondary";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-warning" />;
      case "info": return <Activity className="h-4 w-4 text-info" />;
      case "success": return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor and manage your entire bus fleet</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="default">
              <Bell className="h-4 w-4 mr-2" />
              Alerts ({alerts.length})
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span className="text-xs text-success">{stat.trend}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}/10`}>
                  <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="fleet" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fleet">Fleet Status</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="fleet" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fleet Overview */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Fleet Overview</h2>
              <div className="space-y-3">
                {fleetData.map((bus) => (
                  <Card 
                    key={bus.id} 
                    className={`cursor-pointer transition-all duration-200 hover:shadow-elegant ${
                      selectedBus === bus.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedBus(selectedBus === bus.id ? null : bus.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-primary">
                            <Bus className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{bus.id}</h3>
                            <p className="text-sm text-muted-foreground">{bus.route} • {bus.driver}</p>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(bus.status) as any} className="flex items-center gap-1">
                          {getStatusIcon(bus.status)}
                          {bus.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Location</div>
                          <div className="font-medium">{bus.location}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Passengers</div>
                          <div className="font-medium">{bus.passengers}/{bus.capacity}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Fuel</div>
                          <div className="font-medium">{bus.fuelLevel}%</div>
                        </div>
                      </div>
                      
                      {selectedBus === bus.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Speed</div>
                              <div className="font-medium">{bus.speed} km/h</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Last Update</div>
                              <div className="font-medium">{bus.lastUpdate}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm mb-2">Fuel Level</div>
                            <Progress value={bus.fuelLevel} className="h-2" />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Next maintenance: {bus.nextMaintenance}
                            </span>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid gap-4">
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Bus className="h-12 w-12 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-2">Add New Bus</h3>
                    <p className="text-sm text-muted-foreground mb-4">Register a new bus to the fleet</p>
                    <Button variant="outline" className="w-full">Add Bus</Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-accent" />
                    <h3 className="font-semibold mb-2">Manage Routes</h3>
                    <p className="text-sm text-muted-foreground mb-4">Add, edit, or remove bus routes</p>
                    <Button variant="outline" className="w-full">Manage Routes</Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-info" />
                    <h3 className="font-semibold mb-2">Generate Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create operational reports</p>
                    <Button variant="outline" className="w-full">Generate</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <p className="font-medium">{alert.message}</p>
                        <p className="text-sm text-muted-foreground">{alert.time}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="routes">
          <Card>
            <CardHeader>
              <CardTitle>Route Management</CardTitle>
              <CardDescription>Manage bus routes and schedules</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Route Management Interface</h3>
              <p className="text-muted-foreground mb-4">
                Interactive route planning and management tools would be displayed here
              </p>
              <Button variant="outline">Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-4">
                Detailed analytics, charts, and performance reports would be displayed here
              </p>
              <Button variant="outline">Coming Soon</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;