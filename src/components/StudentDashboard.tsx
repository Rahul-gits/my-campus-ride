import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/apiService";
import { 
  Bus, 
  MapPin, 
  Clock, 
  Navigation, 
  Users, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  History,
  Star,
  Bell,
  Settings,
  Calendar,
  TrendingUp,
  Award,
  Bookmark
} from "lucide-react";
import MapboxMap from "@/components/MapboxMap";
import { Button as UIButton } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useBusTracking, BusLocation, RouteStop } from "@/hooks/useBusTracking";
import { useNotifications, NotificationBell, NotificationDropdown, NotificationAlert } from "@/components/NotificationSystem";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { notifications, addNotification } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [favoriteRoutes, setFavoriteRoutes] = useState<string[]>(["Route A"]);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [rideHistory, setRideHistory] = useState([
    { id: 1, route: "Route A", date: "2024-01-15", time: "08:30", duration: "25 min", rating: 5 },
    { id: 2, route: "Route B", date: "2024-01-14", time: "14:15", duration: "18 min", rating: 4 },
    { id: 3, route: "Route C", date: "2024-01-13", time: "16:45", duration: "22 min", rating: 5 },
  ]);

  // Use the custom hook for bus tracking
  const {
    busLocations,
    routeStops,
    selectedRoute,
    isLoading,
    error,
    lastUpdated,
    setSelectedRoute,
    getBusesByRoute,
    getNextStop,
    getETA
  } = useBusTracking();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate notifications for demo
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const randomNotifications = [
        {
          type: 'info' as const,
          priority: 'medium' as const,
          title: 'Route Update',
          message: 'Route A schedule has been updated. New departure times available.',
          category: 'route' as const,
          role: 'student' as const,
          routeId: 'Route A',
          actions: [
            { id: 'view', label: 'View Schedule', action: 'view_schedule', type: 'primary' as const },
            { id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'secondary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          type: 'warning' as const,
          priority: 'high' as const,
          title: 'Bus Delay Alert',
          message: 'Bus BUS-001 is delayed by 10 minutes due to traffic congestion.',
          category: 'ride' as const,
          role: 'student' as const,
          busId: 'BUS-001',
          routeId: 'Route A',
          actions: [
            { id: 'track', label: 'Track Bus', action: 'track_bus', type: 'primary' as const },
            { id: 'alternative', label: 'Find Alternative', action: 'find_alternative', type: 'secondary' as const }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      if (Math.random() > 0.7) { // 30% chance every 30 seconds
        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000);

    return () => clearInterval(notificationTimer);
  }, [addNotification]);

  const routes = [
    { id: "Route A", name: "Campus → Downtown", buses: getBusesByRoute("Route A").length, nextArrival: "3 min" },
    { id: "Route B", name: "Campus → Mall", buses: getBusesByRoute("Route B").length, nextArrival: "7 min" },
    { id: "Route C", name: "Campus → Station", buses: getBusesByRoute("Route C").length, nextArrival: "12 min" },
  ];

  const currentRouteBuses = getBusesByRoute(selectedRoute);

  const toggleFavorite = async (routeId: string) => {
    try {
      if (favoriteRoutes.includes(routeId)) {
        await apiService.request('DELETE', `/favorites/${routeId}`);
        setFavoriteRoutes(prev => prev.filter(id => id !== routeId));
        addNotification({
          type: 'info',
          priority: 'low',
          title: 'Removed from Favorites',
          message: `${routeId} removed from your favorites.`,
          category: 'route',
          role: 'student',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      } else {
        await apiService.request('POST', '/favorites', { routeId });
        setFavoriteRoutes(prev => [...prev, routeId]);
        addNotification({
          type: 'success',
          priority: 'low',
          title: 'Added to Favorites',
          message: `${routeId} added to your favorites.`,
          category: 'route',
          role: 'student',
          actions: [{ id: 'dismiss', label: 'Dismiss', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error updating favorite:', error);
      addNotification({
        type: 'warning',
        priority: 'medium',
        title: 'Error',
        message: 'Failed to update favorites.',
        category: 'system',
        role: 'student',
        actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
      });
    }
  };

  const bookRide = async (busId: string) => {
    try {
      const result = await apiService.request('POST', '/bookings', {
        studentId: user?.id,
        busId,
        routeId: selectedRoute,
        bookingTime: new Date().toISOString(),
        passengerCount: 1
      });
      
      if (result.success) {
        addNotification({
          type: 'success',
          priority: 'high',
          title: 'Ride Booked!',
          message: `Your ride on ${busId} has been confirmed.`,
          category: 'ride',
          role: 'student',
          busId,
          routeId: selectedRoute,
          actions: [
            { id: 'track', label: 'Track Bus', action: 'track_bus', type: 'primary' },
            { id: 'dismiss', label: 'OK', action: 'dismiss', type: 'secondary' }
          ]
        });
      }
    } catch (error) {
      console.error('Error booking ride:', error);
      addNotification({
        type: 'warning',
        priority: 'high',
        title: 'Booking Failed',
        message: 'Failed to book the ride. Please try again.',
        category: 'ride',
        role: 'student',
        actions: [{ id: 'retry', label: 'Retry', action: 'retry', type: 'primary' }]
      });
    }
  };

  const rateRide = async (rideId: number, rating: number, comment: string) => {
    try {
      const result = await apiService.request('POST', '/ratings', {
        rideId,
        studentId: user?.id,
        rating,
        comment,
        ratedAt: new Date().toISOString()
      });
      
      if (result.success) {
        addNotification({
          type: 'success',
          priority: 'low',
          title: 'Rating Submitted',
          message: 'Thank you for rating your ride!',
          category: 'ride',
          role: 'student',
          actions: [{ id: 'dismiss', label: 'OK', action: 'dismiss', type: 'primary' }]
        });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

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
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Bus className="h-8 w-8 text-primary" />
              Welcome back, {user?.username || 'Student'}!
            </h1>
            <p className="text-muted-foreground">
              {currentTime.toLocaleTimeString()} • Real-time updates
            </p>
          </div>
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                     Live
                   </Badge>
                   <div className="relative">
                     <NotificationBell onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} />
                     <NotificationDropdown 
                       isOpen={showNotificationDropdown} 
                       onClose={() => setShowNotificationDropdown(false)} 
                     />
                   </div>
                   <UIButton asChild variant="outline" size="sm">
                     <a href="/alerts">View All</a>
                   </UIButton>
                 </div>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="history">Ride History</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

               <TabsContent value="tracking" className="space-y-6">
                 {/* Notification Alerts */}
                 {notifications.filter(n => n.priority === 'critical' || n.priority === 'high').slice(0, 2).map((notification) => (
                   <NotificationAlert
                     key={notification.id}
                     notification={notification}
                     onDismiss={() => console.log('Dismissed notification:', notification.id)}
                   />
                 ))}
                 
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
                        <div className="flex items-center gap-2">
                          <div>
                            <h3 className="font-semibold">{route.id}</h3>
                            <p className="text-sm text-muted-foreground">{route.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(route.id);
                            }}
                          >
                            <Heart className={`h-4 w-4 ${favoriteRoutes.includes(route.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                          </Button>
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
                  {routeStops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center gap-3">
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
              {/* Interactive Map */}
              <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Live Bus Tracking
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <MapboxMap
                    busLocations={getBusesByRoute(selectedRoute)}
                    routeStops={routeStops}
                    selectedRoute={selectedRoute}
                    onBusSelect={setSelectedBus}
                    onStopSelect={setSelectedStop}
                    height="400px"
                    showControls={true}
                    enableRouting={true}
                    enableSearch={true}
                  />
                </CardContent>
              </Card>

              {/* Active Buses */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Active Buses on {selectedRoute}
                </h2>
                
                {getBusesByRoute(selectedRoute).map((bus) => {
                  const nextStop = getNextStop(bus);
                  const progress = Math.round((bus.occupied / bus.capacity) * 100);
                  
                  return (
                    <Card 
                      key={bus.id} 
                      className={`hover:shadow-elegant transition-all duration-300 ${
                        selectedBus?.id === bus.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-primary">
                              <Bus className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{bus.name}</CardTitle>
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
                            <div className="text-muted-foreground">Speed</div>
                            <div className="font-medium">{bus.speed || 0} km/h</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Occupancy</div>
                            <div className="font-medium">{bus.occupied}/{bus.capacity}</div>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Occupancy</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {progress}% full
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => bookRide(bus.id)}
                          >
                            Book Ride <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Favorite Routes
              </CardTitle>
              <CardDescription>Your most used routes for quick access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {favoriteRoutes.map((routeId) => {
                  const route = routes.find(r => r.id === routeId);
                  if (!route) return null;
                  return (
                    <Card key={routeId} className="hover:shadow-elegant transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-gradient-primary">
                              <Bus className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{route.id}</h3>
                              <p className="text-sm text-muted-foreground">{route.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{route.buses} buses</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(routeId)}
                            >
                              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                Ride History
              </CardTitle>
              <CardDescription>Your recent bus rides and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <Card key={ride.id} className="hover:shadow-elegant transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-primary">
                            <Bus className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{ride.route}</h3>
                            <p className="text-sm text-muted-foreground">
                              {ride.date} at {ride.time} • Duration: {ride.duration}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < ride.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <Badge variant="outline">{ride.rating}/5</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-500" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <div className="p-2 bg-muted rounded-md">{user?.username}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="p-2 bg-muted rounded-md">{user?.email}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <div className="p-2 bg-muted rounded-md capitalize">{user?.role}</div>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-primary rounded-lg">
                    <div className="text-2xl font-bold">{rideHistory.length}</div>
                    <div className="text-sm text-muted-foreground">Total Rides</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-accent rounded-lg">
                    <div className="text-2xl font-bold">
                      {(rideHistory.reduce((acc, ride) => acc + ride.rating, 0) / rideHistory.length).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Rating</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Favorite Routes</span>
                    <span>{favoriteRoutes.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Member Since</span>
                    <span>Jan 2024</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;