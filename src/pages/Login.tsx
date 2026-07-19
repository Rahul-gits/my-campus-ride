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
  Zap,
  UserPlus,
  Lock,
  Mail,
  Building,
  Sparkles
} from "lucide-react";

type RoleTab = "student" | "driver" | "admin";
type AuthMode = "signin" | "signup";

const Login = () => {
  const { login, register } = useAuth();
  const [params] = useSearchParams();
  const initialRole = (params.get("role") as RoleTab) || "student";
  
  const [authMode, setAuthMode] = useState<AuthMode>("signin");
  const [activeRole, setActiveRole] = useState<RoleTab>(initialRole);
  
  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    
    const res = await login({ email, password });
    if (!res.ok) {
      setError(res.message || "Sign in failed. Please check your credentials.");
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!username.trim()) {
      setError("Please enter a username");
      setIsLoading(false);
      return;
    }

    const profile = {
      firstName,
      lastName,
      studentId: activeRole === "student" ? studentId : undefined,
      licenseNumber: activeRole === "driver" ? licenseNumber : undefined
    };

    const res = await register({
      username,
      email,
      password,
      role: activeRole,
      profile
    });

    if (!res.ok) {
      setError(res.message || "Account creation failed. Please try again.");
    } else {
      setSuccess("Account created successfully! Redirecting...");
    }
    setIsLoading(false);
  };

  const iconForRole = (role: RoleTab) => {
    if (role === "admin") return <Shield className="h-6 w-6 text-purple-400" />;
    if (role === "driver") return <Bus className="h-6 w-6 text-blue-400" />;
    return <User className="h-6 w-6 text-emerald-400" />;
  };

  const featuresForRole = (role: RoleTab) => {
    if (role === "admin") return [
      { icon: Bus, text: "Fleet Management & Control" },
      { icon: Users, text: "Role-Based Access Control" },
      { icon: TrendingUp, text: "Operational Analytics" },
      { icon: Settings, text: "System Configuration" }
    ];
    if (role === "driver") return [
      { icon: MapPin, text: "Turn-by-Turn GPS Directions" },
      { icon: Users, text: "Passenger Count Tracking" },
      { icon: Clock, text: "Live Shift Timings" },
      { icon: Zap, text: "Real-time Dispatch Updates" }
    ];
    return [
      { icon: MapPin, text: "Live GPS Bus Tracking" },
      { icon: Clock, text: "Accurate ETA Predictions" },
      { icon: CheckCircle, text: "Free Campus Service" },
      { icon: Sparkles, text: "Smart Route Optimization" }
    ];
  };

  const demoCredentials = {
    student: { email: "student1@campusride.com", password: "password123" },
    driver: { email: "driver1@campusride.com", password: "password123" },
    admin: { email: "admin@campusride.com", password: "password123" }
  };

  const fillDemoCredentials = () => {
    const creds = demoCredentials[activeRole];
    setEmail(creds.email);
    setPassword(creds.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-5xl grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column - Form Card */}
        <div className="lg:col-span-7">
          <Card className="shadow-2xl border-slate-800 bg-slate-900/90 backdrop-blur-xl text-slate-100">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                  {iconForRole(activeRole)}
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                {authMode === "signin" ? "Sign In to Campus Ride" : "Create Your Account"}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {authMode === "signin" 
                  ? "Access real-time bus tracking and campus transit services" 
                  : "Register for free campus transportation access"}
              </CardDescription>

              {/* Mode Switcher Tabs */}
              <div className="flex justify-center mt-4 p-1 bg-slate-800/80 rounded-xl max-w-xs mx-auto border border-slate-700">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signin"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "signin" 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setError(null); setSuccess(null); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    authMode === "signup" 
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Create Account
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Role Selection Tabs */}
              <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleTab)} className="w-full">
                <TabsList className="grid grid-cols-3 bg-slate-800/60 p-1 border border-slate-700/60 rounded-xl mb-6">
                  <TabsTrigger value="student" className="flex items-center justify-center gap-1.5 text-xs py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <User className="h-3.5 w-3.5" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="driver" className="flex items-center justify-center gap-1.5 text-xs py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <Bus className="h-3.5 w-3.5" />
                    Driver
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center justify-center gap-1.5 text-xs py-2 data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-4 bg-red-950/60 border-red-800 text-red-200">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mb-4 bg-emerald-950/60 border-emerald-800 text-emerald-200">
                    <AlertDescription className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                {/* SIGN IN FORM */}
                {authMode === "signin" && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="signin-email" className="text-xs font-medium text-slate-300">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="signin-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="student@university.edu"
                          required
                          className="h-11 pl-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signin-password" className="text-xs font-medium text-slate-300">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="h-11 pl-10 pr-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                        <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500" />
                        <span>Remember me</span>
                      </label>
                      <button type="button" className="text-blue-400 hover:underline">
                        Forgot password?
                      </button>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Sign In
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    <div className="pt-2 text-center">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={fillDemoCredentials}
                        className="text-xs bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        ⚡ Fill Demo {activeRole.toUpperCase()} Credentials
                      </Button>
                    </div>
                  </form>
                )}

                {/* SIGN UP FORM */}
                {authMode === "signup" && (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-firstname" className="text-xs font-medium text-slate-300">First Name</Label>
                        <Input
                          id="signup-firstname"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Rahul"
                          required
                          className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-lastname" className="text-xs font-medium text-slate-300">Last Name</Label>
                        <Input
                          id="signup-lastname"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Kumar"
                          required
                          className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-username" className="text-xs font-medium text-slate-300">Username</Label>
                      <Input
                        id="signup-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="rahul_kumar"
                        required
                        className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-email" className="text-xs font-medium text-slate-300">Campus Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rahul@university.edu"
                        required
                        className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>

                    {activeRole === "student" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-studentid" className="text-xs font-medium text-slate-300">Student ID / Roll No.</Label>
                        <Input
                          id="signup-studentid"
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="STU-2024-089"
                          className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    )}

                    {activeRole === "driver" && (
                      <div className="space-y-1.5">
                        <Label htmlFor="signup-license" className="text-xs font-medium text-slate-300">Driver License No.</Label>
                        <Input
                          id="signup-license"
                          type="text"
                          value={licenseNumber}
                          onChange={(e) => setLicenseNumber(e.target.value)}
                          placeholder="DL-987654321"
                          className="h-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="signup-password" className="text-xs font-medium text-slate-300">Password (min 6 chars)</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={6}
                          className="h-10 pr-10 bg-slate-800/80 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-500/20"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Create Account
                        </div>
                      )}
                    </Button>
                  </form>
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Information & Brand Banner */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block">
          <div className="space-y-3">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
              🚌 Campus Ride Transit System
            </Badge>
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              Smart Institute Bus Tracking & Management
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time GPS tracking, automated route planning, passenger counts, and instant notification alerts — 100% free service for students and staff.
            </p>
          </div>

          {/* System Live Status */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Service Health</span>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Operational & Online
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-lg font-bold text-white">12/12</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Buses</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-lg font-bold text-emerald-400">100%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">Free Service</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                  <div className="text-lg font-bold text-blue-400">98.5%</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">On-Time</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview per Selected Role */}
          <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                {iconForRole(activeRole)}
                {activeRole.toUpperCase()} Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {featuresForRole(activeRole).map((feat, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                    <feat.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-200">{feat.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
