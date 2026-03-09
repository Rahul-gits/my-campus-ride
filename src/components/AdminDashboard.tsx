import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Bell,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Route,
  Calendar,
  DollarSign,
  Fuel,
  Wrench,
  FileText,
  Download,
  Filter,
  Search,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, NotificationBell, NotificationDropdown, NotificationAlert } from "@/components/NotificationSystem";
import { LogOut } from "lucide-react";
import { apiService } from "@/services/apiService";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedBusForPassengerManagement, setSelectedBusForPassengerManagement] = useState<string | null>(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

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
             licensePlate: "ABC-123",
             year: 2022,
             mileage: 45000,
             occupancyHistory: [
               { time: "14:30", passengers: 32, stop: "Library" },
               { time: "14:25", passengers: 28, stop: "Cafeteria" },
               { time: "14:20", passengers: 35, stop: "Main Gate" },
             ]
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
      licensePlate: "DEF-456",
      year: 2021,
      mileage: 52000,
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
      licensePlate: "GHI-789",
      year: 2020,
      mileage: 68000,
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
      licensePlate: "JKL-012",
      year: 2023,
      mileage: 12000,
    },
  ];

  const userData = [
    { id: 1, name: "Alice Johnson", email: "alice@university.edu", role: "student", status: "active", lastLogin: "2 hours ago" },
    { id: 2, name: "Bob Smith", email: "bob@university.edu", role: "driver", status: "active", lastLogin: "1 hour ago" },
    { id: 3, name: "Carol Davis", email: "carol@university.edu", role: "student", status: "inactive", lastLogin: "3 days ago" },
    { id: 4, name: "David Wilson", email: "david@university.edu", role: "admin", status: "active", lastLogin: "30 min ago" },
  ];

  const routeData = [
    { id: "Route A", name: "Campus → Downtown", stops: 8, duration: "45 min", frequency: "15 min", status: "active" },
    { id: "Route B", name: "Campus → Mall", stops: 6, duration: "35 min", frequency: "20 min", status: "active" },
    { id: "Route C", name: "Campus → Station", stops: 10, duration: "55 min", frequency: "30 min", status: "maintenance" },
  ];

  const alerts = [
    { id: 1, type: "warning", message: "BUS-003 scheduled for maintenance", time: "5 min ago", priority: "high" },
    { id: 2, type: "info", message: "Route B experiencing minor delays", time: "12 min ago", priority: "medium" },
    { id: 3, type: "success", message: "All buses reported in for morning shift", time: "1 hour ago", priority: "low" },
    { id: 4, type: "warning", message: "Low fuel alert for BUS-002", time: "15 min ago", priority: "high" },
  ];

  const stats = [
    { label: "Active Buses", value: "11/12", trend: "+2%", icon: Bus, color: "success" },
    { label: "Total Passengers", value: "1,247", trend: "+8%", icon: Users, color: "info" },
    { label: "Routes Covered", value: "8", trend: "0%", icon: MapPin, color: "accent" },
    { label: "Alerts Today", value: "3", trend: "-25%", icon: AlertTriangle, color: "warning" },
    { label: "Revenue Today", value: "$2,450", trend: "+12%", icon: DollarSign, color: "success" },
    { label: "Fuel Efficiency", value: "8.2 L/100km", trend: "-5%", icon: Fuel, color: "info" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate admin-specific notifications
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const adminNotifications = [
        {
          type: 'warning' as const,
          priority: 'high' as const,
          title: 'Fleet Alert',
          message: 'BUS-002 requires immediate maintenance. Engine warning light activated.',
          category: 'maintenance' as const,
          role: 'admin' as const,
          busId: 'BUS-002',
          actions: [
            { id: 'schedule', label: 'Schedule Maintenance', action: 'schedule_maintenance', type: 'primary' as const },
            { id: 'dispatch', label: 'Contact Driver', action: 'contact_driver', type: 'secondary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'info' as const,
          priority: 'medium' as const,
          title: 'System Update',
          message: 'New route optimization algorithm deployed. Performance improvements expected.',
          category: 'system' as const,
          role: 'admin' as const,
          actions: [
            { id: 'view', label: 'View Details', action: 'view_system_update', type: 'primary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'success' as const,
          priority: 'low' as const,
          title: 'Performance Report',
          message: 'Fleet efficiency increased by 15% this week. Great job team!',
          category: 'system' as const,
          role: 'admin' as const,
          actions: [
            { id: 'report', label: 'View Report', action: 'view_performance_report', type: 'primary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'emergency' as const,
          priority: 'critical' as const,
          title: 'Emergency Response',
          message: 'Emergency situation reported on Route B. Immediate action required.',
          category: 'safety' as const,
          role: 'admin' as const,
          routeId: 'Route B',
          actions: [
            { id: 'respond', label: 'Emergency Response', action: 'emergency_response', type: 'danger' as const },
            { id: 'dispatch', label: 'Contact Emergency', action: 'contact_emergency', type: 'primary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      if (Math.random() > 0.85) { // 15% chance every 60 seconds
        const randomNotification = adminNotifications[Math.floor(Math.random() * adminNotifications.length)];
        addNotification(randomNotification);
      }
    }, 60000);

    return () => clearInterval(notificationTimer);
  }, [addNotification]);

         // Passenger management functions
         const updateBusPassengers = async (busId: string, newCount: number) => {
           try {
             const result = await apiService.updateBusStatus(busId, 'boarding');
             if (result.success) {
               addNotification({
                 type: 'success',
                 priority: 'low',
                 title: 'Passenger Update',
                 message: `Bus ${busId} passenger count updated to ${newCount}`,
                 category: 'system',
                 role: 'admin'
               });
             }
           } catch (error) {
             console.error('Error updating passengers:', error);
             addNotification({
               type: 'warning',
               priority: 'high',
               title: 'Update Failed',
               message: `Failed to update passengers for bus ${busId}`,
               category: 'system',
               role: 'admin'
             });
           }
         };

         const getBusOccupancyStatus = (passengers: number, capacity: number) => {
           const percentage = (passengers / capacity) * 100;
           if (percentage >= 90) return { status: "Full", color: "destructive" };
           if (percentage >= 70) return { status: "Busy", color: "warning" };
           if (percentage >= 50) return { status: "Moderate", color: "info" };
           return { status: "Light", color: "success" };
         };

         // Quick action functions with API integration
         const handleAddBus = async (busData?: any) => {
           try {
             if (!busData) {
               setShowAddBusModal(true);
               return;
             }
             const result = await apiService.createBus(busData);
             if (result.success) {
               setShowAddBusModal(false);
               addNotification({
                 type: 'success',
                 priority: 'high',
                 title: 'Bus Added Successfully',
                 message: `New bus ${busData.id} has been added to the fleet.`,
                 category: 'system',
                 role: 'admin'
               });
             } else {
               addNotification({
                 type: 'warning',
                 priority: 'high',
                 title: 'Failed to Add Bus',
                 message: result.message || 'Failed to add bus to fleet',
                 category: 'system',
                 role: 'admin'
               });
             }
           } catch (error) {
             console.error('Error adding bus:', error);
             addNotification({
               type: 'warning',
               priority: 'high',
               title: 'Error',
               message: 'Failed to add bus. Please try again.',
               category: 'system',
               role: 'admin'
             });
           }
         };

         const handleScheduleMaintenance = async (busId?: string, maintenanceData?: any) => {
           try {
             if (!busId || !maintenanceData) {
               setShowMaintenanceModal(true);
               return;
             }
             const result = await apiService.request('POST', '/maintenance/schedule', {
               busId,
               ...maintenanceData,
               scheduledDate: new Date().toISOString()
             });
             if (result.success) {
               setShowMaintenanceModal(false);
               addNotification({
                 type: 'success',
                 priority: 'high',
                 title: 'Maintenance Scheduled',
                 message: `Maintenance for bus ${busId} has been scheduled successfully.`,
                 category: 'maintenance',
                 role: 'admin'
               });
             }
           } catch (error) {
             console.error('Error scheduling maintenance:', error);
             addNotification({
               type: 'warning',
               priority: 'high',
               title: 'Scheduling Failed',
               message: 'Failed to schedule maintenance. Please try again.',
               category: 'maintenance',
               role: 'admin'
             });
           }
         };

         const handleGenerateReport = async (reportType?: string) => {
           try {
             setShowReportModal(true);
             addNotification({
               type: 'info',
               priority: 'medium',
               title: 'Report Generation',
               message: 'Generating comprehensive system report...',
               category: 'system',
               role: 'admin'
             });
             
             const result = await apiService.request('POST', '/reports/generate', {
               type: reportType || 'summary',
               includedMetrics: ['fleet_status', 'occupancy', 'revenue', 'performance'],
               dateRange: {
                 start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                 end: new Date().toISOString()
               }
             });
             
             if (result.success) {
               setTimeout(() => {
                 addNotification({
                   type: 'success',
                   priority: 'medium',
                   title: 'Report Ready',
                   message: 'System report has been generated successfully. Click to download.',
                   category: 'system',
                   role: 'admin',
                   actions: [{ id: 'download', label: 'Download', action: 'download_report', type: 'primary' }]
                 });
               }, 2000);
             }
           } catch (error) {
             console.error('Error generating report:', error);
             addNotification({
               type: 'warning',
               priority: 'high',
               title: 'Report Generation Failed',
               message: 'Failed to generate report. Please try again.',
               category: 'system',
               role: 'admin'
             });
           }
         };

         // Logout handler
         const handleLogout = () => {
           apiService.clearToken();
           logout();
         };

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
              Admin Dashboard - {user?.username || 'Administrator'}
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleTimeString()} • Comprehensive fleet and system management
            </p>
          </div>
                 <div className="flex gap-2 items-center">
                   <Button variant="outline">
                     <Settings className="h-4 w-4 mr-2" />
                     Settings
                   </Button>
                   <div className="relative">
                     <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} />
                     <NotificationDropdown 
                       isOpen={showNotificationDropdown} 
                       onClose={() => setShowNotificationDropdown(false)} 
                     />
                   </div>
                   <UIButton asChild variant="outline" size="sm">
                     <a href="/alerts" className="flex items-center gap-2"><Bell className="h-4 w-4" /> View All</a>
                   </UIButton>
                   <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                     <LogOut className="h-4 w-4" />
                     Logout
                   </Button>
                 </div>
        </div>
      </div>

      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-elegant transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
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
               <TabsList className="grid w-full grid-cols-7">
                 <TabsTrigger value="fleet">Fleet Management</TabsTrigger>
                 <TabsTrigger value="occupancy">Fleet Occupancy</TabsTrigger>
                 <TabsTrigger value="users">User Management</TabsTrigger>
                 <TabsTrigger value="routes">Route Management</TabsTrigger>
                 <TabsTrigger value="analytics">Analytics</TabsTrigger>
                 <TabsTrigger value="alerts">Alerts</TabsTrigger>
                 <TabsTrigger value="reports">Reports</TabsTrigger>
               </TabsList>

        <TabsContent value="fleet" className="space-y-6">
          {/* Notification Alerts */}
          {notifications.filter(n => n.priority === 'critical' || n.priority === 'high').slice(0, 2).map((notification) => (
            <NotificationAlert
              key={notification.id}
              notification={notification}
              onDismiss={() => console.log('Dismissed notification:', notification.id)}
            />
          ))}
          
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Fleet Management</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search buses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowAddBusModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bus
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Fleet Overview */}
            <div className="space-y-4">
              <div className="space-y-3">
                {fleetData.filter(bus => 
                  bus.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  bus.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  bus.route.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((bus) => (
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
                            <p className="text-xs text-muted-foreground">{bus.licensePlate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusColor(bus.status) as any} className="flex items-center gap-1">
                            {getStatusIcon(bus.status)}
                            {bus.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                             <div className="grid grid-cols-3 gap-4 text-sm">
                               <div>
                                 <div className="text-muted-foreground">Location</div>
                                 <div className="font-medium">{bus.location}</div>
                               </div>
                               <div>
                                 <div className="text-muted-foreground">Passengers</div>
                                 <div className="font-medium">{bus.passengers}/{bus.capacity}</div>
                                 <Badge variant={getBusOccupancyStatus(bus.passengers, bus.capacity).color as any} className="text-xs mt-1">
                                   {getBusOccupancyStatus(bus.passengers, bus.capacity).status}
                                 </Badge>
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
                            <div>
                              <div className="text-muted-foreground">Year</div>
                              <div className="font-medium">{bus.year}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Mileage</div>
                              <div className="font-medium">{bus.mileage.toLocaleString()} km</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm mb-2">Fuel Level</div>
                            <Progress value={bus.fuelLevel} className="h-2" />
                          </div>
                          {/* Passenger Management Controls */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Passenger Management</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Boarding</label>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateBusPassengers(bus.id, bus.passengers + 1)}
                                    disabled={bus.passengers >= bus.capacity}
                                    className="flex-1 text-xs"
                                  >
                                    +1
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateBusPassengers(bus.id, bus.passengers + 3)}
                                    disabled={bus.passengers + 3 > bus.capacity}
                                    className="flex-1 text-xs"
                                  >
                                    +3
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Alighting</label>
                                <div className="flex gap-1">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateBusPassengers(bus.id, bus.passengers - 1)}
                                    disabled={bus.passengers <= 0}
                                    className="flex-1 text-xs"
                                  >
                                    -1
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateBusPassengers(bus.id, bus.passengers - 3)}
                                    disabled={bus.passengers < 3}
                                    className="flex-1 text-xs"
                                  >
                                    -3
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Occupancy Rate</span>
                                <span>{Math.round((bus.passengers / bus.capacity) * 100)}%</span>
                              </div>
                              <Progress value={(bus.passengers / bus.capacity) * 100} className="h-1" />
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Next maintenance: {bus.nextMaintenance}
                            </span>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                            </div>
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
                    <Button variant="outline" className="w-full" onClick={handleAddBus}>
                      Add Bus
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-12 w-12 mx-auto mb-3 text-warning" />
                    <h3 className="font-semibold mb-2">Schedule Maintenance</h3>
                    <p className="text-sm text-muted-foreground mb-4">Plan upcoming maintenance tasks</p>
                    <Button variant="outline" className="w-full" onClick={handleScheduleMaintenance}>
                      Schedule
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-info" />
                    <h3 className="font-semibold mb-2">Generate Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create operational reports</p>
                    <Button variant="outline" className="w-full" onClick={handleGenerateReport}>
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
               </div>
             </TabsContent>

             <TabsContent value="occupancy" className="space-y-6">
               <div className="flex items-center justify-between">
                 <h2 className="text-xl font-semibold">Fleet Occupancy Management</h2>
                 <div className="flex gap-2">
                   <Button variant="outline">
                     <Download className="h-4 w-4 mr-2" />
                     Export Data
                   </Button>
                 </div>
               </div>

               <div className="grid lg:grid-cols-2 gap-6">
                 {/* Fleet Occupancy Overview */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Users className="h-5 w-5 text-blue-500" />
                       Fleet Occupancy Overview
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                       <div className="text-center p-4 bg-gradient-primary rounded-lg">
                         <div className="text-2xl font-bold">
                           {fleetData.reduce((sum, bus) => sum + bus.passengers, 0)}
                         </div>
                         <div className="text-sm text-muted-foreground">Total Passengers</div>
                       </div>
                       <div className="text-center p-4 bg-gradient-accent rounded-lg">
                         <div className="text-2xl font-bold">
                           {Math.round(fleetData.reduce((sum, bus) => sum + (bus.passengers / bus.capacity), 0) / fleetData.length * 100)}%
                         </div>
                         <div className="text-sm text-muted-foreground">Avg Occupancy</div>
                       </div>
                     </div>

                     <div className="space-y-3">
                       {fleetData.map((bus) => (
                         <div key={bus.id} className="p-3 border rounded-lg">
                           <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                               <Bus className="h-4 w-4" />
                               <span className="font-medium">{bus.id}</span>
                               <Badge variant={getBusOccupancyStatus(bus.passengers, bus.capacity).color as any}>
                                 {getBusOccupancyStatus(bus.passengers, bus.capacity).status}
                               </Badge>
                             </div>
                             <span className="text-sm text-muted-foreground">{bus.passengers}/{bus.capacity}</span>
                           </div>
                           <Progress value={(bus.passengers / bus.capacity) * 100} className="h-2" />
                         </div>
                       ))}
                     </div>
                   </CardContent>
                 </Card>

                 {/* Passenger Management Controls */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Settings className="h-5 w-5 text-green-500" />
                       Bulk Passenger Management
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     <div className="space-y-3">
                       <h4 className="font-medium">Quick Actions</h4>
                       <div className="grid grid-cols-2 gap-2">
                         <Button variant="outline" className="flex items-center gap-2">
                           <Users className="h-4 w-4" />
                           Board All Stops
                         </Button>
                         <Button variant="outline" className="flex items-center gap-2">
                           <Users className="h-4 w-4" />
                           Alight All Stops
                         </Button>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <h4 className="font-medium">Individual Bus Controls</h4>
                       <div className="space-y-2">
                         {fleetData.map((bus) => (
                           <div key={bus.id} className="p-3 border rounded-lg">
                             <div className="flex items-center justify-between mb-2">
                               <span className="font-medium">{bus.id}</span>
                               <span className="text-sm text-muted-foreground">{bus.passengers}/{bus.capacity}</span>
                             </div>
                             <div className="flex gap-1">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => updateBusPassengers(bus.id, bus.passengers + 1)}
                                 disabled={bus.passengers >= bus.capacity}
                                 className="flex-1 text-xs"
                               >
                                 +1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => updateBusPassengers(bus.id, bus.passengers + 3)}
                                 disabled={bus.passengers + 3 > bus.capacity}
                                 className="flex-1 text-xs"
                               >
                                 +3
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => updateBusPassengers(bus.id, bus.passengers - 1)}
                                 disabled={bus.passengers <= 0}
                                 className="flex-1 text-xs"
                               >
                                 -1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => updateBusPassengers(bus.id, bus.passengers - 3)}
                                 disabled={bus.passengers < 3}
                                 className="flex-1 text-xs"
                               >
                                 -3
                               </Button>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               </div>
             </TabsContent>

             <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">User Management</h2>
            <Button onClick={() => setShowAddUserModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Last Login</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userData.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-muted-foreground">{user.email}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize">{user.role}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">{user.lastLogin}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Route Management</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </div>

          <div className="grid gap-4">
            {routeData.map((route) => (
              <Card key={route.id} className="hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gradient-primary">
                        <Route className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{route.id}</h3>
                        <p className="text-muted-foreground">{route.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {route.stops} stops
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {route.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Every {route.frequency}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={route.status === 'active' ? 'default' : 'secondary'}>
                        {route.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-4">
                Detailed analytics, charts, and performance reports would be displayed here
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline">View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">System Alerts</h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`${alert.priority === 'high' ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{alert.message}</p>
                          <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.time}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Resolve
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Reports & Documentation
              </CardTitle>
              <CardDescription>Generate and download system reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <h3 className="font-semibold mb-2">Fleet Performance</h3>
                    <p className="text-sm text-muted-foreground mb-4">Bus utilization and efficiency</p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 text-purple-500" />
                    <h3 className="font-semibold mb-2">User Activity</h3>
                    <p className="text-sm text-muted-foreground mb-4">Login and usage statistics</p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-elegant transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 text-green-500" />
                    <h3 className="font-semibold mb-2">Financial Report</h3>
                    <p className="text-sm text-muted-foreground mb-4">Revenue and cost analysis</p>
                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showAddBusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add New Bus</CardTitle>
              <CardDescription>Register a new bus to the fleet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="busNumber">Bus Number</Label>
                <Input id="busNumber" placeholder="BUS-005" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input id="licensePlate" placeholder="XYZ-789" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" placeholder="45" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setShowAddBusModal(false);
                  addNotification({
                    type: 'success',
                    priority: 'low',
                    title: 'Bus Added',
                    message: 'New bus added successfully!',
                    category: 'system',
                    role: 'admin'
                  });
                }} className="flex-1">
                  Add Bus
                </Button>
                <Button variant="outline" onClick={() => setShowAddBusModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Schedule Maintenance</CardTitle>
              <CardDescription>Plan upcoming maintenance tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="busSelect">Select Bus</Label>
                <select className="w-full p-2 border rounded-md" id="busSelect">
                  <option value="">Choose a bus...</option>
                  {fleetData.map(bus => (
                    <option key={bus.id} value={bus.id}>{bus.id}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maintenanceType">Maintenance Type</Label>
                <select className="w-full p-2 border rounded-md" id="maintenanceType">
                  <option value="">Select type...</option>
                  <option value="routine">Routine Check</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input id="scheduledDate" type="date" />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setShowMaintenanceModal(false);
                  addNotification({
                    type: 'success',
                    priority: 'low',
                    title: 'Maintenance Scheduled',
                    message: 'Maintenance scheduled successfully!',
                    category: 'maintenance',
                    role: 'admin'
                  });
                }} className="flex-1">
                  Schedule
                </Button>
                <Button variant="outline" onClick={() => setShowMaintenanceModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>Create operational reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <select className="w-full p-2 border rounded-md" id="reportType">
                  <option value="">Select report type...</option>
                  <option value="fleet">Fleet Performance</option>
                  <option value="passenger">Passenger Analytics</option>
                  <option value="maintenance">Maintenance Report</option>
                  <option value="financial">Financial Summary</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <select className="w-full p-2 border rounded-md" id="dateRange">
                  <option value="">Select range...</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  setShowReportModal(false);
                  addNotification({
                    type: 'success',
                    priority: 'low',
                    title: 'Report Generated',
                    message: 'Report generated successfully!',
                    category: 'system',
                    role: 'admin'
                  });
                }} className="flex-1">
                  Generate
                </Button>
                <Button variant="outline" onClick={() => setShowReportModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;