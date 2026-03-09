import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Bus, 
  Clock, 
  Zap, 
  Brain, 
  AlertTriangle,
  Target,
  BarChart3,
  Activity,
  Smartphone,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

interface AnalyticsData {
  activeBuses: number;
  studentsOnline: number;
  avgWaitTime: number;
  routeEfficiency: number;
  predictions: {
    nextDelay: string;
    crowdedRoute: string;
    optimalTime: string;
  };
  trends: {
    busUsage: number[];
    waitTimes: number[];
    efficiency: number[];
  };
  alerts: Array<{
    id: string;
    type: 'delay' | 'crowded' | 'weather' | 'maintenance';
    message: string;
    severity: 'low' | 'medium' | 'high';
    timestamp: Date;
  }>;
}

const AIAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeBuses: 12,
    studentsOnline: 1247,
    avgWaitTime: 3.2,
    routeEfficiency: 94,
    predictions: {
      nextDelay: 'Route A - 5 min delay due to traffic',
      crowdedRoute: 'Route B - 85% capacity',
      optimalTime: 'Leave in 8 minutes for fastest commute'
    },
    trends: {
      busUsage: [45, 52, 48, 61, 58, 67, 72],
      waitTimes: [4.2, 3.8, 3.5, 3.2, 2.9, 3.1, 3.2],
      efficiency: [89, 91, 93, 94, 96, 95, 94]
    },
    alerts: [
      {
        id: '1',
        type: 'delay',
        message: 'Route A experiencing 5-minute delays due to traffic congestion',
        severity: 'medium',
        timestamp: new Date()
      },
      {
        id: '2',
        type: 'crowded',
        message: 'Route B at 85% capacity - consider alternative routes',
        severity: 'high',
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: '3',
        type: 'weather',
        message: 'Light rain expected - buses may run 2-3 minutes slower',
        severity: 'low',
        timestamp: new Date(Date.now() - 600000)
      }
    ]
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAnalytics(prev => ({
        ...prev,
        activeBuses: prev.activeBuses + (Math.random() > 0.5 ? 1 : -1),
        studentsOnline: prev.studentsOnline + Math.floor(Math.random() * 20 - 10),
        avgWaitTime: Math.max(1, prev.avgWaitTime + (Math.random() * 0.4 - 0.2)),
        routeEfficiency: Math.min(100, Math.max(80, prev.routeEfficiency + (Math.random() * 2 - 1))),
        trends: {
          ...prev.trends,
          busUsage: [...prev.trends.busUsage.slice(1), Math.floor(Math.random() * 30 + 50)],
          waitTimes: [...prev.trends.waitTimes.slice(1), Math.max(1, prev.trends.waitTimes[prev.trends.waitTimes.length - 1] + (Math.random() * 0.4 - 0.2))],
          efficiency: [...prev.trends.efficiency.slice(1), Math.min(100, Math.max(80, prev.trends.efficiency[prev.trends.efficiency.length - 1] + (Math.random() * 2 - 1)))]
        }
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (current: number, previous: number) => {
    return current > previous ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'delay': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'crowded': return <Users className="h-4 w-4 text-red-500" />;
      case 'weather': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'maintenance': return <Wrench className="h-4 w-4 text-gray-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-500" />
            AI Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time insights powered by artificial intelligence</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Live Data
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeBuses}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {getTrendIcon(analytics.activeBuses, 11)}
              <span>+1 from yesterday</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.studentsOnline.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {getTrendIcon(analytics.studentsOnline, 1200)}
              <span>+15% from last hour</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgWaitTime.toFixed(1)} min</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {getTrendIcon(3.5, analytics.avgWaitTime)}
              <span>-0.3 min from yesterday</span>
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Route Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.routeEfficiency}%</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {getTrendIcon(analytics.routeEfficiency, 92)}
              <span>+2% from last week</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Predictions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Predictions
            </CardTitle>
            <CardDescription>Machine learning insights for optimal commuting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-orange-800">Delay Alert</span>
              </div>
              <p className="text-orange-700">{analytics.predictions.nextDelay}</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-red-500" />
                <span className="font-semibold text-red-800">Crowding Alert</span>
              </div>
              <p className="text-red-700">{analytics.predictions.crowdedRoute}</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-800">Optimal Timing</span>
              </div>
              <p className="text-green-700">{analytics.predictions.optimalTime}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Performance Trends
            </CardTitle>
            <CardDescription>Real-time performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Bus Usage</span>
                <span className="text-sm text-muted-foreground">{analytics.trends.busUsage[analytics.trends.busUsage.length - 1]}%</span>
              </div>
              <Progress value={analytics.trends.busUsage[analytics.trends.busUsage.length - 1]} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Wait Times</span>
                <span className="text-sm text-muted-foreground">{analytics.trends.waitTimes[analytics.trends.waitTimes.length - 1].toFixed(1)} min</span>
              </div>
              <Progress value={100 - (analytics.trends.waitTimes[analytics.trends.waitTimes.length - 1] * 20)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Efficiency</span>
                <span className="text-sm text-muted-foreground">{analytics.trends.efficiency[analytics.trends.efficiency.length - 1]}%</span>
              </div>
              <Progress value={analytics.trends.efficiency[analytics.trends.efficiency.length - 1]} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500" />
            Real-time Alerts
          </CardTitle>
          <CardDescription>Live system notifications and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-500" />
              <span className="text-sm">Network: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-green-500" />
              <span className="text-sm">Power: Stable</span>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 text-green-500" />
              <span className="text-sm">GPS: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm">AI: Learning</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAnalyticsDashboard;
