import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Rocket, 
  Brain, 
  Trophy, 
  Navigation, 
  Bell, 
  MapPin, 
  Zap, 
  Star,
  TrendingUp,
  Users,
  Clock,
  Leaf,
  Shield,
  Smartphone,
  BarChart3,
  Target,
  Activity,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const FeaturesShowcase = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    activeUsers: 1247,
    busesTracked: 12,
    routesOptimized: 8,
    notificationsSent: 3456
  });

  const features = [
    {
      id: 'ai-analytics',
      title: 'AI-Powered Analytics',
      description: 'Machine learning insights for optimal commuting',
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      color: 'purple',
      highlights: [
        'Predictive delay analysis',
        'Real-time performance metrics',
        'Smart route recommendations',
        'Automated alerts and insights'
      ],
      demo: 'Live dashboard with real-time data updates'
    },
    {
      id: 'gamification',
      title: 'Gamification System',
      description: 'Earn points, unlock achievements, and compete with friends',
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      color: 'yellow',
      highlights: [
        'Points and rewards system',
        'Achievement unlocks',
        'Leaderboards and competitions',
        'Eco-friendly incentives'
      ],
      demo: 'Interactive leaderboard with live updates'
    },
    {
      id: 'route-optimizer',
      title: 'Smart Route Optimizer',
      description: 'AI-powered route planning with real-time optimization',
      icon: <Navigation className="h-8 w-8 text-blue-500" />,
      color: 'blue',
      highlights: [
        'Multi-criteria optimization',
        'Real-time traffic integration',
        'Weather-aware routing',
        'Dynamic pricing suggestions'
      ],
      demo: 'Route comparison with live traffic data'
    },
    {
      id: 'notifications',
      title: 'Real-time Notifications',
      description: 'Stay updated with intelligent alerts and notifications',
      icon: <Bell className="h-8 w-8 text-green-500" />,
      color: 'green',
      highlights: [
        'Push, email, and SMS alerts',
        'Customizable notification preferences',
        'Smart quiet hours',
        'Priority-based filtering'
      ],
      demo: 'Live notification center with test alerts'
    },
    {
      id: 'mapbox-integration',
      title: 'Interactive Mapbox Integration',
      description: 'Advanced mapping with real-time bus tracking',
      icon: <MapPin className="h-8 w-8 text-red-500" />,
      color: 'red',
      highlights: [
        'Real-time GPS tracking',
        'Interactive markers and popups',
        'Route visualization',
        'Multi-style map support'
      ],
      demo: 'Interactive map with live bus positions'
    }
  ];

  // Simulate real-time stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        busesTracked: prev.busesTracked + (Math.random() > 0.7 ? 1 : 0),
        routesOptimized: prev.routesOptimized + (Math.random() > 0.8 ? 1 : 0),
        notificationsSent: prev.notificationsSent + Math.floor(Math.random() * 20)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'purple': return 'bg-purple-50 border-purple-200 text-purple-800';
      case 'yellow': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'blue': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'green': return 'bg-green-50 border-green-200 text-green-800';
      case 'red': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Rocket className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold">Next-Level Features</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Experience the future of campus transportation with AI-powered features, 
          gamification, and real-time intelligence
        </p>
      </div>

      {/* Live Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Live System Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.activeUsers.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.busesTracked}</div>
              <div className="text-sm text-muted-foreground">Buses Tracked</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Live</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.routesOptimized}</div>
              <div className="text-sm text-muted-foreground">Routes Optimized</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Target className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-purple-600">AI Powered</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{stats.notificationsSent.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Notifications Sent</div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <Bell className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Today</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {features.map((feature, index) => (
          <Button
            key={feature.id}
            variant={activeFeature === index ? 'default' : 'outline'}
            onClick={() => setActiveFeature(index)}
            className="flex items-center gap-2"
          >
            {feature.icon}
            {feature.title}
          </Button>
        ))}
      </div>

      {/* Active Feature Showcase */}
      <Card className="overflow-hidden">
        <CardHeader className={`${getColorClasses(features[activeFeature].color)} border-b`}>
          <div className="flex items-center gap-4">
            {features[activeFeature].icon}
            <div>
              <CardTitle className="text-2xl">{features[activeFeature].title}</CardTitle>
              <CardDescription className="text-lg">{features[activeFeature].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature Highlights */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Key Features
              </h3>
              <div className="space-y-3">
                {features[activeFeature].highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Demo Preview */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Live Demo
              </h3>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-muted-foreground mb-4">{features[activeFeature].demo}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Try Demo
                  </Button>
                  <Button size="sm">
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile View
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">⚛️</div>
              <div className="font-semibold">React 18</div>
              <div className="text-sm text-muted-foreground">Frontend Framework</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-semibold">Mapbox GL JS</div>
              <div className="text-sm text-muted-foreground">Interactive Maps</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold">AI/ML</div>
              <div className="text-sm text-muted-foreground">Smart Analytics</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold">Real-time</div>
              <div className="text-sm text-muted-foreground">Live Updates</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
            <CardTitle>For Students</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Real-time bus tracking</li>
              <li>• Smart route planning</li>
              <li>• Gamified commuting</li>
              <li>• Instant notifications</li>
              <li>• Eco-friendly rewards</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>For Administrators</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• AI-powered analytics</li>
              <li>• Performance monitoring</li>
              <li>• Predictive maintenance</li>
              <li>• Route optimization</li>
              <li>• Real-time insights</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <Leaf className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>For Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Reduced carbon footprint</li>
              <li>• Optimized fuel usage</li>
              <li>• Eco-friendly incentives</li>
              <li>• Sustainable commuting</li>
              <li>• Green route planning</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience the Future?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of students already using our next-generation campus transportation system
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-blue-600">
              <Smartphone className="h-5 w-5 mr-2" />
              Download Mobile App
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              <MapPin className="h-5 w-5 mr-2" />
              Start Tracking Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesShowcase;
