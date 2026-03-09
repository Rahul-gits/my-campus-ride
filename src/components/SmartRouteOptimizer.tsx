import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Clock, 
  Zap, 
  Leaf, 
  Users, 
  Bus, 
  Navigation,
  Route,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Star,
  DollarSign
} from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  duration: number;
  distance: number;
  cost: number;
  ecoScore: number;
  comfort: number;
  reliability: number;
  transfers: number;
  busRoutes: string[];
  stops: Array<{
    name: string;
    time: string;
    type: 'pickup' | 'transfer' | 'destination';
  }>;
  features: string[];
  warnings: string[];
}

interface OptimizationCriteria {
  priority: 'time' | 'cost' | 'eco' | 'comfort';
  maxTransfers: number;
  maxWalkDistance: number;
  avoidCrowdedRoutes: boolean;
  preferAirConditioned: boolean;
}

const SmartRouteOptimizer = () => {
  const [fromLocation, setFromLocation] = useState('Main Gate');
  const [toLocation, setToLocation] = useState('Library');
  const [departureTime, setDepartureTime] = useState(new Date().toISOString().slice(0, 16));
  const [criteria, setCriteria] = useState<OptimizationCriteria>({
    priority: 'time',
    maxTransfers: 2,
    maxWalkDistance: 500,
    avoidCrowdedRoutes: false,
    preferAirConditioned: true
  });

  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([
    {
      id: '1',
      name: 'Fastest Route',
      duration: 12,
      distance: 2.3,
      cost: 15,
      ecoScore: 85,
      comfort: 70,
      reliability: 95,
      transfers: 0,
      busRoutes: ['Route A'],
      stops: [
        { name: 'Main Gate', time: '09:00', type: 'pickup' },
        { name: 'Library', time: '09:12', type: 'destination' }
      ],
      features: ['Direct', 'Frequent Service', 'Air Conditioned'],
      warnings: ['High traffic expected']
    },
    {
      id: '2',
      name: 'Eco-Friendly Route',
      duration: 18,
      distance: 3.1,
      cost: 10,
      ecoScore: 95,
      comfort: 80,
      reliability: 90,
      transfers: 1,
      busRoutes: ['Route B', 'Route C'],
      stops: [
        { name: 'Main Gate', time: '09:00', type: 'pickup' },
        { name: 'Central Hub', time: '09:12', type: 'transfer' },
        { name: 'Library', time: '09:18', type: 'destination' }
      ],
      features: ['Electric Bus', 'Scenic Route', 'Low Emissions'],
      warnings: []
    },
    {
      id: '3',
      name: 'Comfort Route',
      duration: 22,
      distance: 2.8,
      cost: 20,
      ecoScore: 75,
      comfort: 95,
      reliability: 85,
      transfers: 1,
      busRoutes: ['Route D', 'Route E'],
      stops: [
        { name: 'Main Gate', time: '09:00', type: 'pickup' },
        { name: 'Shopping Center', time: '09:15', type: 'transfer' },
        { name: 'Library', time: '09:22', type: 'destination' }
      ],
      features: ['Premium Seating', 'WiFi', 'USB Charging'],
      warnings: ['Limited frequency']
    },
    {
      id: '4',
      name: 'Budget Route',
      duration: 25,
      distance: 4.2,
      cost: 5,
      ecoScore: 80,
      comfort: 60,
      reliability: 80,
      transfers: 2,
      busRoutes: ['Route F', 'Route G', 'Route H'],
      stops: [
        { name: 'Main Gate', time: '09:00', type: 'pickup' },
        { name: 'Market Square', time: '09:10', type: 'transfer' },
        { name: 'Sports Complex', time: '09:20', type: 'transfer' },
        { name: 'Library', time: '09:25', type: 'destination' }
      ],
      features: ['Low Cost', 'Student Discount'],
      warnings: ['Multiple transfers', 'Longer journey']
    }
  ]);

  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [realTimeUpdates, setRealTimeUpdates] = useState({
    traffic: 'Moderate',
    weather: 'Clear',
    delays: ['Route A: 2 min delay'],
    crowdLevel: 'Medium'
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeUpdates(prev => ({
        ...prev,
        traffic: ['Light', 'Moderate', 'Heavy'][Math.floor(Math.random() * 3)],
        crowdLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'time': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cost': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'eco': return <Leaf className="h-4 w-4 text-green-500" />;
      case 'comfort': return <Star className="h-4 w-4 text-purple-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const optimizeRoutes = () => {
    // Simulate AI optimization
    const optimized = routeOptions.sort((a, b) => {
      switch (criteria.priority) {
        case 'time':
          return a.duration - b.duration;
        case 'cost':
          return a.cost - b.cost;
        case 'eco':
          return b.ecoScore - a.ecoScore;
        case 'comfort':
          return b.comfort - a.comfort;
        default:
          return 0;
      }
    });

    setRouteOptions(optimized);
  };

  useEffect(() => {
    optimizeRoutes();
  }, [criteria]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Navigation className="h-8 w-8 text-blue-500" />
            Smart Route Optimizer
          </h1>
          <p className="text-muted-foreground">AI-powered route planning with real-time optimization</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-yellow-500" />
          AI Powered
        </Badge>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-500" />
            Plan Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="from">From</Label>
              <Input
                id="from"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                placeholder="Starting location"
              />
            </div>
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                placeholder="Destination"
              />
            </div>
            <div>
              <Label htmlFor="time">Departure Time</Label>
              <Input
                id="time"
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={optimizeRoutes} className="w-full">
                <Route className="h-4 w-4 mr-2" />
                Optimize Routes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Optimization Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Priority</Label>
              <select
                value={criteria.priority}
                onChange={(e) => setCriteria({...criteria, priority: e.target.value as any})}
                className="w-full p-2 border rounded-md"
              >
                <option value="time">Fastest</option>
                <option value="cost">Cheapest</option>
                <option value="eco">Eco-Friendly</option>
                <option value="comfort">Most Comfortable</option>
              </select>
            </div>
            <div>
              <Label>Max Transfers</Label>
              <select
                value={criteria.maxTransfers}
                onChange={(e) => setCriteria({...criteria, maxTransfers: parseInt(e.target.value)})}
                className="w-full p-2 border rounded-md"
              >
                <option value={0}>Direct Only</option>
                <option value={1}>1 Transfer</option>
                <option value={2}>2 Transfers</option>
                <option value={3}>3+ Transfers</option>
              </select>
            </div>
            <div>
              <Label>Max Walk Distance</Label>
              <select
                value={criteria.maxWalkDistance}
                onChange={(e) => setCriteria({...criteria, maxWalkDistance: parseInt(e.target.value)})}
                className="w-full p-2 border rounded-md"
              >
                <option value={200}>200m</option>
                <option value={500}>500m</option>
                <option value={1000}>1km</option>
                <option value={2000}>2km+</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="avoidCrowded"
                checked={criteria.avoidCrowdedRoutes}
                onChange={(e) => setCriteria({...criteria, avoidCrowdedRoutes: e.target.checked})}
              />
              <Label htmlFor="avoidCrowded">Avoid Crowded Routes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="preferAC"
                checked={criteria.preferAirConditioned}
                onChange={(e) => setCriteria({...criteria, preferAirConditioned: e.target.checked})}
              />
              <Label htmlFor="preferAC">Prefer AC Buses</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Real-time Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Traffic</div>
              <div className="font-semibold">{realTimeUpdates.traffic}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Weather</div>
              <div className="font-semibold">{realTimeUpdates.weather}</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Crowd Level</div>
              <div className="font-semibold">{realTimeUpdates.crowdLevel}</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Delays</div>
              <div className="font-semibold">{realTimeUpdates.delays.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Options */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Route className="h-6 w-6 text-blue-500" />
          Optimized Routes
        </h2>
        
        {routeOptions.map((route, index) => (
          <Card key={route.id} className={`${selectedRoute === route.id ? 'ring-2 ring-blue-500' : ''} hover:shadow-lg transition-shadow`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    <CardDescription>
                      {route.busRoutes.join(' → ')} • {route.transfers} transfer{route.transfers !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getPriorityIcon(criteria.priority)}
                    {criteria.priority === 'time' ? `${route.duration} min` :
                     criteria.priority === 'cost' ? `₹${route.cost}` :
                     criteria.priority === 'eco' ? `${route.ecoScore}%` :
                     `${route.comfort}%`}
                  </Badge>
                  <Button
                    variant={selectedRoute === route.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRoute(route.id)}
                  >
                    {selectedRoute === route.id ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{route.duration}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{route.cost}</div>
                  <div className="text-sm text-muted-foreground">Cost</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(route.ecoScore)}`}>{route.ecoScore}%</div>
                  <div className="text-sm text-muted-foreground">Eco Score</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(route.comfort)}`}>{route.comfort}%</div>
                  <div className="text-sm text-muted-foreground">Comfort</div>
                </div>
              </div>

              {/* Route Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Route Details:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {route.stops.map((stop, stopIndex) => (
                    <React.Fragment key={stopIndex}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          stop.type === 'pickup' ? 'bg-green-500' :
                          stop.type === 'transfer' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <span className="text-sm">{stop.name}</span>
                        <span className="text-xs text-muted-foreground">({stop.time})</span>
                      </div>
                      {stopIndex < route.stops.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {route.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Warnings */}
                {route.warnings.length > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-yellow-800">Warnings:</div>
                      <ul className="text-sm text-yellow-700">
                        {route.warnings.map((warning, warningIndex) => (
                          <li key={warningIndex}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Route Actions */}
      {selectedRoute && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              Ready to Go!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Route selected: {routeOptions.find(r => r.id === selectedRoute)?.name}</p>
                <p className="text-sm text-muted-foreground">Estimated arrival: {new Date(new Date(departureTime).getTime() + (routeOptions.find(r => r.id === selectedRoute)?.duration || 0) * 60000).toLocaleTimeString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button>
                  <Navigation className="h-4 w-4 mr-2" />
                  Start Navigation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartRouteOptimizer;
