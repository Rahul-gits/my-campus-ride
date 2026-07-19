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
import { useNotifications, NotificationAlert } from "@/components/NotificationSystem";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/apiService";
import { websocketService } from "@/services/websocketService";

const DriverDashboard = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [bus, setBus] = useState<any>(null);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [eta, setEta] = useState("5 min");
  const [fuelLevel, setFuelLevel] = useState(78);
  const [passengerCount, setPassengerCount] = useState(0);
  const [busCapacity, setBusCapacity] = useState(45);
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
  const [activeTab, setActiveTab] = useState("operations");
  const [currentStop, setCurrentStop] = useState("Main Gate");
  const [nextStop, setNextStop] = useState("Library");

  useEffect(() => {
    const loadDriverBus = async () => {
      try {
        const result = await apiService.getAllBuses();
        if (result.success && result.data) {
          const driverBus = result.data.find((b: any) => 
            b.driver && (b.driver._id === user?.id || b.driver === user?.id)
          );
          if (driverBus) {
            setBus(driverBus);
            setIsOnDuty(driverBus.status === 'active');
            setPassengerCount(driverBus.occupancy?.current ?? 0);
            setBusCapacity(driverBus.capacity ?? 45);
            setCurrentSpeed(driverBus.speed ?? 0);
          }
        }
      } catch (err) {
        console.error('Failed to load driver bus:', err);
      }
    };
    if (user?.id) {
      loadDriverBus();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isOnDuty) {
        setCurrentSpeed(Math.floor(Math.random() * 15) + 20);
        setFuelLevel(prev => Math.max(20, prev - 0.05));
      } else {
        setCurrentSpeed(0);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isOnDuty]);

  // Real-time Geolocation tracking
  useEffect(() => {
    if (!isOnDuty || !bus?._id) return;

    let watchId: number | null = null;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    if (navigator.geolocation) {
      console.log("Starting real-time geolocation watch for bus:", bus._id);
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude: lat, longitude: lng, speed, heading } = position.coords;
          
          // Emit coordinate update to the Socket.IO backend
          websocketService.send({
            type: 'driver-location-update',
            data: {
              busId: bus._id,
              lat,
              lng,
              speed: speed ? Math.round(speed * 3.6) : Math.floor(Math.random() * 20) + 15,
              direction: heading || 0,
              occupancy: passengerCount
            }
          });

          if (speed !== null && speed !== undefined) {
            setCurrentSpeed(Math.round(speed * 3.6));
          }
        },
        (error) => {
          console.warn("Geolocation watch error, falling back to simulated drift:", error.message);
          
          fallbackInterval = setInterval(() => {
            const simulatedLat = (bus.currentLocation?.lat || 17.3850) + (Math.random() - 0.5) * 0.002;
            const simulatedLng = (bus.currentLocation?.lng || 78.4867) + (Math.random() - 0.5) * 0.002;
            
            websocketService.send({
              type: 'driver-location-update',
              data: {
                busId: bus._id,
                lat: simulatedLat,
                lng: simulatedLng,
                speed: Math.floor(Math.random() * 20) + 20,
                direction: Math.floor(Math.random() * 360),
                occupancy: passengerCount
              }
            });
          }, 4000);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (fallbackInterval !== null) {
        clearInterval(fallbackInterval);
      }
    };
  }, [isOnDuty, bus?._id, passengerCount]);

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
  const addPassengers = async (count: number) => {
    if (passengerCount + count <= busCapacity) {
      const nextCount = passengerCount + count;
      setPassengerCount(nextCount);
      setShiftStats(prev => ({ ...prev, passengersServed: prev.passengersServed + count }));

      const newEntry = {
        time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        action: "boarding" as const,
        count,
        stop: currentStop
      };
      setPassengerHistory(prev => [newEntry, ...prev.slice(0, 9)]);

      // Real-time WebSocket emission
      websocketService.send({
        type: 'driver-location-update',
        data: {
          busId: bus?._id || 'BUS001',
          speed: currentSpeed,
          occupancy: nextCount
        }
      });

      if (bus?._id) {
        try {
          await apiService.updateBus(bus._id, {
            occupancy: { current: nextCount, max: busCapacity }
          });
        } catch (err) {
          console.error('Failed to update passenger count on backend:', err);
        }
      }
    }
  };

  const removePassengers = async (count: number) => {
    if (passengerCount - count >= 0) {
      const nextCount = passengerCount - count;
      setPassengerCount(nextCount);
      const newEntry = {
        time: currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        action: "alighting" as const,
        count,
        stop: currentStop
      };
      setPassengerHistory(prev => [newEntry, ...prev.slice(0, 9)]);

      // Real-time WebSocket emission
      websocketService.send({
        type: 'driver-location-update',
        data: {
          busId: bus?._id || 'BUS001',
          speed: currentSpeed,
          occupancy: nextCount
        }
      });

      if (bus?._id) {
        try {
          await apiService.updateBus(bus._id, {
            occupancy: { current: nextCount, max: busCapacity }
          });
        } catch (err) {
          console.error('Failed to update passenger count on backend:', err);
        }
      }
    }
  };

  const advanceToNextStop = () => {
    const stopsList = ['Main Gate', 'Library', 'Central Hub', 'Science Block', 'Sports Complex', 'Hostel Block A', 'Bus Terminal'];
    const idx = stopsList.indexOf(currentStop);
    const nextIdx = (idx + 1) % stopsList.length;
    const followingIdx = (nextIdx + 1) % stopsList.length;
    
    const newCurrent = stopsList[nextIdx];
    const newNext = stopsList[followingIdx];
    
    setCurrentStop(newCurrent);
    setNextStop(newNext);
    setShiftStats(prev => ({ ...prev, stopsCompleted: prev.stopsCompleted + 1 }));

    // Emit live stop arrival to socket subscribers
    websocketService.send({
      type: 'driver-location-update',
      data: {
        busId: bus?._id || 'BUS001',
        currentStop: newCurrent,
        nextStop: newNext,
        speed: currentSpeed,
        occupancy: passengerCount
      }
    });

    addNotification({
      type: 'success',
      priority: 'medium',
      title: 'Stop Reached',
      message: `Arrived at ${newCurrent}. Next stop is ${newNext}.`,
      category: 'route',
      role: 'driver',
      actions: [{ id: 'dismiss', label: 'OK', action: 'dismiss', type: 'primary' }]
    });
  };

  const markIncidentResolved = (id: number) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, resolved: true } : inc));
    addNotification({
      type: 'success',
      priority: 'medium',
      title: 'Incident Resolved',
      message: `Incident #${id} has been marked resolved.`,
      category: 'system',
      role: 'driver',
      actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
    });
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
        busId: bus?.busNumber || 'BUS001',
        type: incidentType,
        description,
        location: 'Current Location',
        timestamp: new Date().toISOString()
      });
      
      if (result.success) {
        // Emit via Socket.IO
        websocketService.send({
          type: 'driver-incident',
          data: {
            busId: bus?._id || bus?.busNumber || 'BUS001',
            type: incidentType,
            description,
            location: 'Current Location'
          }
        });

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
        busId: bus?.busNumber || 'BUS001',
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
      const result = await apiService.request<any>('POST', '/incidents/photo', {
        driverId: user?.id,
        type: photoType,
        description,
        timestamp: new Date().toISOString(),
        busId: bus?.busNumber || 'BUS001'
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
      let success = true;
      if (bus?._id) {
        const result = await apiService.updateBus(bus._id, {
          status: 'inactive',
          currentStatus: 'stopped',
          speed: 0
        });
        success = result.success;
      }
      
      if (success) {
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
    }
  };

  const handleStartShift = async () => {
    try {
      let success = true;
      if (bus?._id) {
        const result = await apiService.updateBus(bus._id, {
          status: 'active',
          currentStatus: 'stopped',
          speed: 0
        });
        success = result.success;
      }
      
      if (success) {
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
    }
  };

  return (
    <div className="space-y-6 p-6 pb-24">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">

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
                    <span className="text-sm text-muted-foreground">Current Stop</span>
                    <span className="font-medium text-emerald-600">{currentStop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Next Stop</span>
                    <span className="font-medium text-blue-600">{nextStop}</span>
                  </div>
                </div>
                <Button onClick={advanceToNextStop} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center justify-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Arrived at Stop / Advance to Next Stop
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-500" />
                  Live Navigation Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                    <div>
                      <div className="font-semibold text-emerald-700 dark:text-emerald-300">Current Stop</div>
                      <div className="text-sm text-muted-foreground">{currentStop}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300">Next Upcoming Stop</div>
                      <div className="text-sm text-muted-foreground">{nextStop} (ETA: {eta})</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-500/10 rounded-lg border border-slate-500/20">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <div>
                      <div className="font-semibold">Final Terminal</div>
                      <div className="text-sm text-muted-foreground">Campus Bus Terminal</div>
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
                        <Button variant="outline" size="sm" className="mt-2" onClick={() => markIncidentResolved(incident.id)}>
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

      {/* Floating Bottom Slide Navigation Bar for Driver Operations */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg">
        <div className="backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/95 border border-slate-700/60 text-white rounded-2xl shadow-2xl p-1.5 flex items-center justify-between relative ring-1 ring-white/10">
          {[
            { id: 'operations', label: 'Operations', icon: Bus, color: 'text-emerald-400' },
            { id: 'route', label: 'Route Info', icon: Navigation, color: 'text-blue-400' },
            { id: 'passengers', label: 'Passengers', icon: Users, color: 'text-purple-400' },
            { id: 'reports', label: 'Reports', icon: AlertTriangle, color: 'text-amber-400' },
            { id: 'profile', label: 'Profile', icon: User, color: 'text-indigo-400' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-white bg-white/15 font-bold shadow-lg scale-105 ring-1 ring-white/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1 transition-transform ${isActive ? 'scale-110 ' + tab.color : ''}`} />
                <span className="text-[11px] font-medium leading-none tracking-tight">{tab.label}</span>
                {isActive && (
                  <span className="absolute -top-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;


