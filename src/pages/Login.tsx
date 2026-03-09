import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Bus, 
  Shield, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  Settings,
  TrendingUp,
  Zap
} from "lucide-react";

type RoleTab = "student" | "driver" | "admin";

const Login = () => {
  const { login } = useAuth();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as RoleTab) || "student";
  const [activeRole, setActiveRole] = useState<RoleTab>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const res = await login({ email, password });
    if (!res.ok) setError(res.message || "Login failed");
    setIsLoading(false);
  };

  const iconForRole = (role: RoleTab) => {
    if (role === "admin") return <Shield className="h-6 w-6" />;
    if (role === "driver") return <Bus className="h-6 w-6" />;
    return <User className="h-6 w-6" />;
  };

  const titleForRole = (role: RoleTab) => {
    if (role === "admin") return "Admin Login";
    if (role === "driver") return "Driver Login";
    return "Student Login";
  };

  const descriptionForRole = (role: RoleTab) => {
    if (role === "admin") return "Manage fleet, users, and system operations";
    if (role === "driver") return "Access driver console and route management";
    return "Track buses and manage your campus rides";
  };

  const featuresForRole = (role: RoleTab) => {
    if (role === "admin") return [
      { icon: Bus, text: "Fleet Management" },
      { icon: Users, text: "User Management" },
      { icon: TrendingUp, text: "Analytics & Reports" },
      { icon: Settings, text: "System Settings" }
    ];
    if (role === "driver") return [
      { icon: MapPin, text: "Route Navigation" },
      { icon: Users, text: "Passenger Management" },
      { icon: Clock, text: "Shift Tracking" },
      { icon: Zap, text: "Real-time Updates" }
    ];
    return [
      { icon: MapPin, text: "Live Bus Tracking" },
      { icon: Clock, text: "Route Schedules" },
      { icon: Users, text: "Ride History" },
      { icon: CheckCircle, text: "Favorites" }
    ];
  };

  const demoCredentials = {
    student: { email: "student@university.edu", password: "password123" },
    driver: { email: "driver@university.edu", password: "password123" },
    admin: { email: "admin@university.edu", password: "password123" }
  };

  const fillDemoCredentials = () => {
    const creds = demoCredentials[activeRole];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8">
        {/* Left Side - Login Form */}
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-primary">
                {iconForRole(activeRole)}
              </div>
            </div>
            <CardTitle className="text-2xl">{titleForRole(activeRole)}</CardTitle>
            <CardDescription>{descriptionForRole(activeRole)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleTab)} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  Driver
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {(["student","driver","admin"] as RoleTab[]).map((role) => (
                <TabsContent key={role} value={role}>
                  <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${role}-email`}>Email Address</Label>
                      <Input
                        id={`${role}-email`}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu"
                        required
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`${role}-password`}>Password</Label>
                      <div className="relative">
                        <Input
                          id={`${role}-password`}
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-11 px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span>Remember me</span>
                      </label>
                      <Button variant="link" className="p-0 h-auto">
                        Forgot password?
                      </Button>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    <div className="text-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={fillDemoCredentials}
                        className="text-xs"
                      >
                        Use Demo Credentials
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Side - Features & Info */}
        <div className="hidden lg:block space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Campus Ride Management System
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Smart transportation solutions for modern campuses
            </p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {iconForRole(activeRole)}
                {titleForRole(activeRole)} Features
              </CardTitle>
              <CardDescription>
                Everything you need for efficient campus transportation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {featuresForRole(activeRole).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">System Status</span>
                <Badge variant="success" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Online
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Buses</span>
                <span className="font-semibold">12/12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Routes Covered</span>
                <span className="font-semibold">8 routes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Users Online</span>
                <span className="font-semibold">247</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-blue-100 mb-4">
                Contact our support team for assistance with login or system access.
              </p>
              <Button variant="secondary" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;


