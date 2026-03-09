import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Bus, 
  MapPin, 
  Clock, 
  Phone, 
  AlertTriangle, 
  CheckCircle, 
  Pause, 
  Play, 
  Bell,
  Users,
  Fuel,
  Gauge,
  Navigation,
  FileText,
  Calendar,
  TrendingUp,
  Settings,
  User,
  Route,
  Camera,
  MessageSquare
} from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications, NotificationBell, NotificationDropdown, NotificationAlert } from "@/components/NotificationSystem";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/apiService";

const DriverDashboard = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(32);
  const [eta, setEta] = useState("5 min");
  const [fuelLevel, setFuelLevel] = useState(78);
  const [passengerCount, setPassengerCount] = useState(28);
  const [busCapacity] = useState(45);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [passengerHistory, setPassengerHistory] = useState([
    { time: "14:30", action: "boarding", count: 3, stop: "Main Gate" },
    { time: "14:25", action: "alighting", count: 2, stop: "Library" },
    { time: "14:20", action: "boarding", count: 5, stop: "Cafeteria" },
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [incidents, setIncidents] = useState([
    { id: 1, type: "delay", description: "Traffic congestion at Main St", time: "14:30", resolved: false },
    { id: 2, type: "maintenance", description: "Door mechanism issue", time: "10:15", resolved: true },
  ]);

  const [passengerFeedback, setPassengerFeedback] = useState([
    { id: 1, rating: 5, comment: "Great service!", passenger: "Student", time: "13:45" },
    { id: 2, rating: 4, comment: "On time and clean", passenger: "Faculty", time: "12:30" },
  ]);

  const [shiftStats, setShiftStats] = useState({
    startTime: "07:45",
    stopsCompleted: 12,
    passengersServed: 156,
    onTimePerformance: 96,
    fuelConsumed: 12.5,
    distanceTraveled: 45.2
  });

  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate real-time updates
      setCurrentSpeed(Math.floor(Math.random() * 10) + 25);
      setFuelLevel(prev => Math.max(20, prev - 0.1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Simulate driver-specific notifications
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const driverNotifications = [
        {
          type: 'warning' as const,
          priority: 'high' as const,
          title: 'Low Fuel Alert',
          message: 'Fuel level is below 30%. Consider refueling at the next stop.',
          category: 'maintenance' as const,
          role: 'driver' as const,
          busId: 'BUS-001',
          actions: [
            { id: 'refuel', label: 'Find Fuel Station', action: 'find_fuel_station', type: 'primary' as const },
            { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'info' as const,
          priority: 'medium' as const,
          title: 'Route Update',
          message: 'Traffic congestion reported on Main Street. Consider alternative route.',
          category: 'route' as const,
          role: 'driver' as const,
          routeId: 'Route A',
          actions: [
            { id: 'reroute', label: 'View Alternative', action: 'view_alternative', type: 'primary' as const },
            { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'success' as const,
          priority: 'low' as const,
          title: 'Shift Milestone',
          message: 'Great job! You\'ve completed 50% of your shift with excellent performance.',
          category: 'system' as const,
          role: 'driver' as const,
          actions: [
            { id: 'view', label: 'View Stats', action: 'view_stats', type: 'primary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      if (Math.random() > 0.8) { // 20% chance every 45 seconds
        const randomNotification = driverNotifications[Math.floor(Math.random() * driverNotifications.length)];
        addNotification(randomNotification);
      }
    }, 45000);

    return () => clearInterval(notificationTimer);
  }, [addNotification]);

  // Passenger management functions
  const addPassengers = (count: number) => {
    if (passengerCount + count <= busCapacity) {
      setPassengerCount(prev => prev + count);
      const newEntry = {
        time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        action: "boarding" as const,
        count,
        stop: "Current Stop"
      };
      setPassengerHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    }
  };

  const removePassengers = (count: number) => {
    if (passengerCount - count >= 0) {
      setPassengerCount(prev => prev - count);
      const newEntry = {
        time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        action: "alighting" as const,
        count,
        stop: "Current Stop"
      };
      setPassengerHistory(prev => [newEntry, ...prev.slice(0, 9)]);
    }
  };

  const getOccupancyStatus = () => {
    const percentage = (passengerCount / busCapacity) * 100;
    if (percentage >= 90) return { status: "Full", color: "destructive" };
    if (percentage >= 70) return { status: "Busy", color: "warning" };
    if (percentage >= 50) return { status: "Moderate", color: "info" };
    return { status: "Light", color: "success" };
  };

  // Action functions with API integration
  const handleReportIncident = () => {
    setShowIncidentModal(true);
  };

  const submitIncidentReport = async (incidentType: string, description: string) => {
    try {
      const result = await apiService.request<any>('POST', '/incidents', {
        busId: user?.id,
        type: incidentType,
        description,
        location: 'Current Location',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        setShowIncidentModal(false);
        setIncidents(prev => [{
          id: prev.length + 1,
          type: incidentType,
          description,
          time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
          resolved: false
        }, ...prev]);
        addNotification({
          type: 'success',
          priority: 'high',
          title: 'Incident Reported',
          message: 'Your incident report has been submitted successfully.',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      } else {
        addNotification({
          type: 'warning',
          priority: 'high',
          title: 'Report Failed',
          message: result.message || 'Failed to submit incident report',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error reporting incident:', error);
      addNotification({
        type: 'warning',
        priority: 'high',
        title: 'Error',
        message: 'Failed to report incident. Please try again.',
        category: 'system',
        role: 'driver',
        actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
      });
    }
  };

  const handleContactDispatch = () => {
    setShowContactModal(true);
  };

  const submitContactDispatch = async (reason: string, message: string) => {
    try {
      const result = await apiService.request<any>('POST', '/dispatch/contact', {
        driverId: user?.id,
        reason,
        message,
        busId: 'BUS-001',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        setShowContactModal(false);
        addNotification({
          type: 'success',
          priority: 'medium',
          title: 'Dispatch Contacted',
          message: 'Your message has been sent to dispatch center.',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error contacting dispatch:', error);
    }
  };

  const handleTakePhoto = () => {
    setShowPhotoModal(true);
  };

  const submitPhoto = async (photoType: string, description: string) => {
    try {
      // In a real app, this would upload the photo
      const result = await apiService.request<any>('POST', '/incidents/photo', {
        driverId: user?.id,
        type: photoType,
        description,
        timestamp: new Date().toISOString(),
        busId: 'BUS-001'
      });
      
      if (result.success) {
        setShowPhotoModal(false);
        addNotification({
          type: 'success',
          priority: 'medium',
          title: 'Photo Uploaded',
          message: 'Documentation photo has been uploaded successfully.',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const handleEndShift = async () => {
    try {
      const result = await apiService.request<any>('POST', '/drivers/shift/end', {
        driverId: user?.id,
        endTime: new Date().toISOString(),
        shiftData: {
          stopsCompleted: shiftStats.stopsCompleted,
          passengersServed: shiftStats.passengersServed,
          distanceTraveled: shiftStats.distanceTraveled,
          fuelConsumed: shiftStats.fuelConsumed,
          onTimePerformance: shiftStats.onTimePerformance
        }
      });
      
      if (result.success) {
        setIsOnDuty(false);
        addNotification({
          type: 'success',
          priority: 'medium',
          title: 'Shift Ended',
          message: 'Your shift has been saved successfully.',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error ending shift:', error);
      addNotification({
        type: 'warning',
        priority: 'high',
        title: 'Shift End Failed',
        message: 'Failed to end shift. Please try again.',
        category: 'system',
        role: 'driver',
        actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
      });
    }
  };

  const handleStartShift = async () => {
    try {
      const result = await apiService.request<any>('POST', '/drivers/shift/start', {
        driverId: user?.id,
        startTime: new Date().toISOString(),
        busId: 'BUS-001'
      });
      
      if (result.success) {
        setIsOnDuty(true);
        const startTimeString = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        setShiftStats(prev => ({
          ...prev,
          startTime: startTimeString,
          stopsCompleted: 0,
          passengersServed: 0,
          distanceTraveled: 0,
          fuelConsumed: 0
        }));
        addNotification({
          type: 'success',
          priority: 'medium',
          title: 'Shift Started',
          message: 'Your shift has been started. Safe travels!',
          category: 'system',
          role: 'driver',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error starting shift:', error);
      addNotification({
        type: 'warning',
        priority: 'high',
        title: 'Shift Start Failed',
        message: 'Failed to start shift. Please try again.',
        category: 'system',
        role: 'driver',
        actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
      });
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bus className="h-8 w-8 text-primary" />
            Driver Console - {user?.username || 'Driver'}
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleTimeString()} • Operational tools for your active route
          </p>
        </div>
               <div className="flex items-center gap-2">
                 <Badge variant={isOnDuty ? "success" : "secondary"} className="flex items-center gap-1">
                   {isOnDuty ? <CheckCircle className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                   {isOnDuty ? "On Duty" : "Off Duty"}
                 </Badge>
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
               </div>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="route">Route Info</TabsTrigger>
          <TabsTrigger value="passengers">Passengers</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

               <TabsContent value="operations" className="space-y-6">
                 {/* Notification Alerts */}
                 {notifications.filter(n => n.priority === 'critical' || n.priority === 'high').slice(0, 2).map((notification) => (
                   <NotificationAlert
                     key={notification.id}
                     notification={notification}
                     onDismiss={() => console.log('Dismissed notification:', notification.id)}
                   />
                 ))}
                 
                 <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Operations Panel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Current Route Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                       {/* Real-time Status */}
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                         <div className="text-center p-3 bg-gradient-primary rounded-lg">
                           <div className="text-2xl font-bold">{eta}</div>
                           <div className="text-xs text-muted-foreground">Next Stop ETA</div>
                         </div>
                         <div className="text-center p-3 bg-gradient-accent rounded-lg">
                           <div className="text-2xl font-bold">{currentSpeed}</div>
                           <div className="text-xs text-muted-foreground">km/h</div>
                         </div>
                         <div className="text-center p-3 bg-gradient-success rounded-lg">
                           <div className="text-2xl font-bold">{passengerCount}/{busCapacity}</div>
                           <div className="text-xs text-muted-foreground">Passengers</div>
                           <Badge variant={getOccupancyStatus().color as any} className="text-xs mt-1">
                             {getOccupancyStatus().status}
                           </Badge>
                         </div>
                         <div className="text-center p-3 bg-gradient-warning rounded-lg">
                           <div className="text-2xl font-bold">{fuelLevel}%</div>
                           <div className="text-xs text-muted-foreground">Fuel Level</div>
                         </div>
                       </div>

                <Separator />

                {/* Fuel Level */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      Fuel Level
                    </span>
                    <span>{fuelLevel}%</span>
                  </div>
                  <Progress value={fuelLevel} className="h-2" />
                  {fuelLevel < 30 && (
                    <div className="text-sm text-warning flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Low fuel warning
                    </div>
                  )}
                </div>

                       {/* Passenger Controls */}
                       <div className="space-y-4">
                         <h3 className="text-lg font-semibold flex items-center gap-2">
                           <Users className="h-5 w-5 text-primary" />
                           Passenger Management
                         </h3>
                         
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <label className="text-sm font-medium">Boarding</label>
                             <div className="flex gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => addPassengers(1)}
                                 disabled={passengerCount >= busCapacity}
                                 className="flex-1"
                               >
                                 +1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => addPassengers(3)}
                                 disabled={passengerCount + 3 > busCapacity}
                                 className="flex-1"
                               >
                                 +3
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => addPassengers(5)}
                                 disabled={passengerCount + 5 > busCapacity}
                                 className="flex-1"
                               >
                                 +5
                               </Button>
                             </div>
                           </div>
                           
                           <div className="space-y-2">
                             <label className="text-sm font-medium">Alighting</label>
                             <div className="flex gap-2">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => removePassengers(1)}
                                 disabled={passengerCount <= 0}
                                 className="flex-1"
                               >
                                 -1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => removePassengers(3)}
                                 disabled={passengerCount < 3}
                                 className="flex-1"
                               >
                                 -3
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => removePassengers(5)}
                                 disabled={passengerCount < 5}
                                 className="flex-1"
                               >
                                 -5
                               </Button>
                             </div>
                           </div>
                         </div>

                         <div className="space-y-2">
                           <div className="flex justify-between text-sm">
                             <span>Occupancy Rate</span>
                             <span>{Math.round((passengerCount / busCapacity) * 100)}%</span>
                           </div>
                           <Progress value={(passengerCount / busCapacity) * 100} className="h-2" />
                         </div>
                       </div>

                       <Separator />

                       {/* Action Buttons */}
                       <div className="flex flex-wrap gap-3">
                         <Button
                           variant={isOnDuty ? "destructive" : "default"}
                           onClick={isOnDuty ? handleEndShift : handleStartShift}
                           className="flex items-center gap-2"
                         >
                           {isOnDuty ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                           {isOnDuty ? "End Shift" : "Start Shift"}
                         </Button>
                         <Button variant="outline" className="flex items-center gap-2" onClick={handleReportIncident}>
                           <AlertTriangle className="h-4 w-4" />
                           Report Incident
                         </Button>
                         <Button variant="outline" className="flex items-center gap-2" onClick={handleContactDispatch}>
                           <Phone className="h-4 w-4" />
                           Contact Dispatch
                         </Button>
                         <Button variant="outline" className="flex items-center gap-2" onClick={handleTakePhoto}>
                           <Camera className="h-4 w-4" />
                           Take Photo
                         </Button>
                       </div>
              </CardContent>
            </Card>

            {/* Shift Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Today's Shift
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Started
                    </span>
                    <span className="font-medium">{shiftStats.startTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Stops Completed
                    </span>
                    <span className="font-medium">{shiftStats.stopsCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Passengers Served
                    </span>
                    <span className="font-medium">{shiftStats.passengersServed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      On-time Performance
                    </span>
                    <span className="font-medium text-success">{shiftStats.onTimePerformance}%</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fuel Consumed</span>
                    <span>{shiftStats.fuelConsumed}L</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Distance Traveled</span>
                    <span>{shiftStats.distanceTraveled}km</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="route" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="h-5 w-5 text-blue-500" />
                  Route Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Route Name</span>
                    <span className="font-medium">Route A - Campus Loop</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Stops</span>
                    <span className="font-medium">8 stops</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Estimated Duration</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Stop</span>
                    <span className="font-medium">Main Gate</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-500" />
                  Navigation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div>
                      <div className="font-medium">Current Location</div>
                      <div className="text-sm text-muted-foreground">Near Library</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent/5 rounded-lg">
                    <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-medium">Next Stop</div>
                      <div className="text-sm text-muted-foreground">Main Gate - {eta}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/5 rounded-lg">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <div>
                      <div className="font-medium">Final Destination</div>
                      <div className="text-sm text-muted-foreground">Bus Terminal</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

               <TabsContent value="passengers" className="space-y-6">
                 <div className="grid lg:grid-cols-2 gap-6">
                   <Card>
                     <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                         <Users className="h-5 w-5 text-purple-500" />
                         Passenger Management
                       </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       <div className="text-center p-6 bg-gradient-primary rounded-lg">
                         <div className="text-3xl font-bold">{passengerCount}</div>
                         <div className="text-sm text-muted-foreground">Current Passengers</div>
                         <div className="text-xs text-muted-foreground mt-1">Capacity: {busCapacity}</div>
                         <Badge variant={getOccupancyStatus().color as any} className="mt-2">
                           {getOccupancyStatus().status}
                         </Badge>
                       </div>

                       <div className="space-y-2">
                         <div className="flex justify-between text-sm">
                           <span>Occupancy Rate</span>
                           <span>{Math.round((passengerCount / busCapacity) * 100)}%</span>
                         </div>
                         <Progress value={(passengerCount / busCapacity) * 100} className="h-2" />
                       </div>

                       {/* Quick Passenger Controls */}
                       <div className="space-y-3">
                         <h4 className="font-medium">Quick Controls</h4>
                         <div className="grid grid-cols-2 gap-2">
                           <div className="space-y-1">
                             <label className="text-xs text-muted-foreground">Boarding</label>
                             <div className="flex gap-1">
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => addPassengers(1)}
                                 disabled={passengerCount >= busCapacity}
                                 className="flex-1 text-xs"
                               >
                                 +1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => addPassengers(3)}
                                 disabled={passengerCount + 3 > busCapacity}
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
                                 onClick={() => removePassengers(1)}
                                 disabled={passengerCount <= 0}
                                 className="flex-1 text-xs"
                               >
                                 -1
                               </Button>
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => removePassengers(3)}
                                 disabled={passengerCount < 3}
                                 className="flex-1 text-xs"
                               >
                                 -3
                               </Button>
                             </div>
                           </div>
                         </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4 text-sm">
                         <div className="text-center p-3 bg-muted rounded-lg">
                           <div className="font-semibold">Students</div>
                           <div className="text-lg">{Math.floor(passengerCount * 0.7)}</div>
                         </div>
                         <div className="text-center p-3 bg-muted rounded-lg">
                           <div className="font-semibold">Faculty</div>
                           <div className="text-lg">{Math.floor(passengerCount * 0.3)}</div>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                         <Clock className="h-5 w-5 text-blue-500" />
                         Passenger Activity History
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-3">
                         {passengerHistory.map((entry, index) => (
                           <div key={index} className="p-3 border rounded-lg">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <Badge variant={entry.action === "boarding" ? "success" : "info"}>
                                   {entry.action === "boarding" ? "Boarding" : "Alighting"}
                                 </Badge>
                                 <span className="font-medium">{entry.count} passengers</span>
                               </div>
                               <span className="text-xs text-muted-foreground">{entry.time}</span>
                             </div>
                             <p className="text-sm text-muted-foreground">Stop: {entry.stop}</p>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>

                   <Card>
                     <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                         <MessageSquare className="h-5 w-5 text-yellow-500" />
                         Recent Feedback
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="space-y-3">
                         {passengerFeedback.map((feedback) => (
                           <div key={feedback.id} className="p-3 border rounded-lg">
                             <div className="flex items-center justify-between mb-2">
                               <div className="flex items-center gap-2">
                                 <span className="font-medium">{feedback.passenger}</span>
                                 <div className="flex">
                                   {[...Array(5)].map((_, i) => (
                                     <div key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</div>
                                   ))}
                                 </div>
                               </div>
                               <span className="text-xs text-muted-foreground">{feedback.time}</span>
                             </div>
                             <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                           </div>
                         ))}
                       </div>
                     </CardContent>
                   </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-500" />
                  Incident Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <div key={incident.id} className={`p-3 border rounded-lg ${incident.resolved ? 'bg-green-50' : 'bg-yellow-50'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={incident.resolved ? "success" : "warning"}>
                          {incident.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{incident.time}</span>
                      </div>
                      <p className="text-sm">{incident.description}</p>
                      {!incident.resolved && (
                        <Button variant="outline" size="sm" className="mt-2">
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-success rounded-lg">
                    <div className="text-2xl font-bold">{shiftStats.onTimePerformance}%</div>
                    <div className="text-xs text-muted-foreground">On-time</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-primary rounded-lg">
                    <div className="text-2xl font-bold">4.8</div>
                    <div className="text-xs text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Safety Score</span>
                    <span>98/100</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" />
                  Driver Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Driver ID</label>
                    <div className="p-2 bg-muted rounded-md">DRV-{user?.id?.slice(-4) || '001'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <div className="p-2 bg-muted rounded-md">{user?.username || 'Driver Name'}</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">License Number</label>
                    <div className="p-2 bg-muted rounded-md">DL-2024-001234</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Experience</label>
                    <div className="p-2 bg-muted rounded-md">5 years</div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Update Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Settings & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-report incidents</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fuel alerts</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Route notifications</span>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showIncidentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Report Incident</CardTitle>
              <CardDescription>Report any issues or incidents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="incidentType">Incident Type</Label>
                <select className="w-full p-2 border rounded-md" id="incidentType">
                  <option value="">Select type...</option>
                  <option value="delay">Delay</option>
                  <option value="mechanical">Mechanical Issue</option>
                  <option value="passenger">Passenger Issue</option>
                  <option value="traffic">Traffic Problem</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incidentDescription">Description</Label>
                <textarea 
                  id="incidentDescription" 
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Describe the incident..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  const incidentType = (document.getElementById('incidentType') as HTMLSelectElement)?.value;
                  const description = (document.getElementById('incidentDescription') as HTMLTextAreaElement)?.value;
                  if (incidentType && description) {
                    submitIncidentReport(incidentType, description);
                  }
                }} className="flex-1">
                  Report
                </Button>
                <Button variant="outline" onClick={() => setShowIncidentModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Contact Dispatch</CardTitle>
              <CardDescription>Get in touch with dispatch center</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactReason">Reason for Contact</Label>
                <select className="w-full p-2 border rounded-md" id="contactReason">
                  <option value="">Select reason...</option>
                  <option value="emergency">Emergency</option>
                  <option value="route">Route Information</option>
                  <option value="schedule">Schedule Change</option>
                  <option value="passenger">Passenger Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactMessage">Message</Label>
                <textarea 
                  id="contactMessage" 
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Your message..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  const reason = (document.getElementById('contactReason') as HTMLSelectElement)?.value;
                  const message = (document.getElementById('contactMessage') as HTMLTextAreaElement)?.value;
                  if (reason && message) {
                    submitContactDispatch(reason, message);
                  }
                }} className="flex-1">
                  Send
                </Button>
                <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Take Photo</CardTitle>
              <CardDescription>Capture a photo for documentation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photoType">Photo Type</Label>
                <select className="w-full p-2 border rounded-md" id="photoType">
                  <option value="">Select type...</option>
                  <option value="incident">Incident Documentation</option>
                  <option value="damage">Damage Report</option>
                  <option value="maintenance">Maintenance Issue</option>
                  <option value="general">General Documentation</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="photoDescription">Description</Label>
                <textarea 
                  id="photoDescription" 
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Describe what you're photographing..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  const photoType = (document.getElementById('photoType') as HTMLSelectElement)?.value;
                  const description = (document.getElementById('photoDescription') as HTMLTextAreaElement)?.value;
                  if (photoType && description) {
                    submitPhoto(photoType, description);
                  }
                }} className="flex-1">
                  Take Photo
                </Button>
                <Button variant="outline" onClick={() => setShowPhotoModal(false)} className="flex-1">
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

export default DriverDashboard;


