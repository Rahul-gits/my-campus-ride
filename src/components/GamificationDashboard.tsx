import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Zap, 
  Leaf, 
  Users, 
  Clock, 
  Target,
  Gift,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Bus
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  points: number;
  streak: number;
  achievements: Achievement[];
  stats: {
    totalTrips: number;
    ecoFriendlyTrips: number;
    onTimeArrivals: number;
    helpingOthers: number;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'eco' | 'social' | 'efficiency' | 'streak';
}

interface LeaderboardEntry {
  rank: number;
  user: UserProfile;
  weeklyPoints: number;
  monthlyPoints: number;
}

const GamificationDashboard = () => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Rahul Kumar',
    avatar: '👨‍💻',
    level: 8,
    points: 2847,
    streak: 12,
    achievements: [
      {
        id: '1',
        title: 'Eco Warrior',
        description: 'Used eco-friendly transport 50 times',
        icon: '🌱',
        points: 250,
        unlocked: true,
        unlockedAt: new Date('2024-01-15'),
        category: 'eco'
      },
      {
        id: '2',
        title: 'Early Bird',
        description: 'Arrived on time for 30 consecutive days',
        icon: '🐦',
        points: 200,
        unlocked: true,
        unlockedAt: new Date('2024-01-20'),
        category: 'efficiency'
      },
      {
        id: '3',
        title: 'Social Helper',
        description: 'Helped 10 fellow commuters',
        icon: '🤝',
        points: 150,
        unlocked: true,
        unlockedAt: new Date('2024-01-25'),
        category: 'social'
      },
      {
        id: '4',
        title: 'Streak Master',
        description: 'Maintained 10-day streak',
        icon: '🔥',
        points: 100,
        unlocked: true,
        unlockedAt: new Date('2024-01-30'),
        category: 'streak'
      },
      {
        id: '5',
        title: 'Carbon Neutral',
        description: 'Achieved carbon neutral commuting',
        icon: '♻️',
        points: 500,
        unlocked: false,
        category: 'eco'
      }
    ],
    stats: {
      totalTrips: 156,
      ecoFriendlyTrips: 89,
      onTimeArrivals: 134,
      helpingOthers: 12
    }
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      user: {
        id: '2',
        name: 'Priya Sharma',
        avatar: '👩‍🎓',
        level: 12,
        points: 4567,
        streak: 25,
        achievements: [],
        stats: { totalTrips: 0, ecoFriendlyTrips: 0, onTimeArrivals: 0, helpingOthers: 0 }
      },
      weeklyPoints: 450,
      monthlyPoints: 1800
    },
    {
      rank: 2,
      user: {
        id: '3',
        name: 'Amit Singh',
        avatar: '👨‍🎓',
        level: 10,
        points: 3892,
        streak: 18,
        achievements: [],
        stats: { totalTrips: 0, ecoFriendlyTrips: 0, onTimeArrivals: 0, helpingOthers: 0 }
      },
      weeklyPoints: 380,
      monthlyPoints: 1520
    },
    {
      rank: 3,
      user: {
        id: '4',
        name: 'Sneha Patel',
        avatar: '👩‍💼',
        level: 9,
        points: 3245,
        streak: 15,
        achievements: [],
        stats: { totalTrips: 0, ecoFriendlyTrips: 0, onTimeArrivals: 0, helpingOthers: 0 }
      },
      weeklyPoints: 320,
      monthlyPoints: 1280
    },
    {
      rank: 4,
      user: userProfile,
      weeklyPoints: 285,
      monthlyPoints: 1140
    }
  ]);

  const [dailyChallenges, setDailyChallenges] = useState([
    {
      id: '1',
      title: 'Eco Commute',
      description: 'Use public transport 3 times today',
      reward: 50,
      progress: 2,
      target: 3,
      completed: false
    },
    {
      id: '2',
      title: 'Early Arrival',
      description: 'Arrive 5 minutes early to your destination',
      reward: 30,
      progress: 0,
      target: 1,
      completed: false
    },
    {
      id: '3',
      title: 'Help a Fellow',
      description: 'Help someone with directions or information',
      reward: 40,
      progress: 0,
      target: 1,
      completed: false
    }
  ]);

  const [recentActivities, setRecentActivities] = useState([
    {
      id: '1',
      type: 'achievement',
      message: 'Unlocked "Streak Master" achievement!',
      points: 100,
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      type: 'trip',
      message: 'Completed eco-friendly trip to Library',
      points: 15,
      timestamp: new Date(Date.now() - 7200000)
    },
    {
      id: '3',
      type: 'help',
      message: 'Helped fellow student with route information',
      points: 25,
      timestamp: new Date(Date.now() - 10800000)
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUserProfile(prev => ({
        ...prev,
        points: prev.points + Math.floor(Math.random() * 5),
        streak: prev.streak + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getLevelProgress = () => {
    const currentLevelPoints = userProfile.level * 500;
    const nextLevelPoints = (userProfile.level + 1) * 500;
    const progress = ((userProfile.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getAchievementIcon = (category: string) => {
    switch (category) {
      case 'eco': return <Leaf className="h-4 w-4 text-green-500" />;
      case 'social': return <Users className="h-4 w-4 text-blue-500" />;
      case 'efficiency': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'streak': return <Zap className="h-4 w-4 text-orange-500" />;
      default: return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'trip': return <Bus className="h-4 w-4 text-blue-500" />;
      case 'help': return <Users className="h-4 w-4 text-green-500" />;
      default: return <Star className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Gamification Hub
          </h1>
          <p className="text-muted-foreground">Earn points, unlock achievements, and compete with friends!</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          Level {userProfile.level}
        </Badge>
      </div>

      {/* User Profile Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="text-4xl">{userProfile.avatar}</div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
              <CardDescription>Level {userProfile.level} • {userProfile.points.toLocaleString()} points</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-500">{userProfile.streak}</div>
              <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress to Level {userProfile.level + 1}</span>
                <span className="text-sm text-muted-foreground">{getLevelProgress().toFixed(1)}%</span>
              </div>
              <Progress value={getLevelProgress()} className="h-3" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userProfile.stats.totalTrips}</div>
                <div className="text-sm text-muted-foreground">Total Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userProfile.stats.ecoFriendlyTrips}</div>
                <div className="text-sm text-muted-foreground">Eco Trips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{userProfile.stats.onTimeArrivals}</div>
                <div className="text-sm text-muted-foreground">On Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{userProfile.stats.helpingOthers}</div>
                <div className="text-sm text-muted-foreground">Helped Others</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-yellow-500" />
              Achievements
            </CardTitle>
            <CardDescription>Unlock rewards by completing challenges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userProfile.achievements.map((achievement) => (
              <div key={achievement.id} className={`p-3 rounded-lg border ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{achievement.title}</h4>
                      {getAchievementIcon(achievement.category)}
                      <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-green-600 mt-1">
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Daily Challenges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Daily Challenges
            </CardTitle>
            <CardDescription>Complete today's challenges to earn bonus points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyChallenges.map((challenge) => (
              <div key={challenge.id} className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{challenge.title}</h4>
                  <Badge variant="outline">{challenge.reward} pts</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                <div className="flex items-center gap-2">
                  <Progress value={(challenge.progress / challenge.target) * 100} className="flex-1 h-2" />
                  <span className="text-sm text-muted-foreground">{challenge.progress}/{challenge.target}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Leaderboard
            </CardTitle>
            <CardDescription>Top performers this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-lg ${entry.user.id === userProfile.id ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                    {entry.rank <= 3 ? (
                      entry.rank === 1 ? <Crown className="h-4 w-4 text-yellow-500" /> :
                      entry.rank === 2 ? <Medal className="h-4 w-4 text-gray-400" /> :
                      <Award className="h-4 w-4 text-orange-500" />
                    ) : (
                      <span className="text-sm font-bold">{entry.rank}</span>
                    )}
                  </div>
                  <div className="text-2xl">{entry.user.avatar}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{entry.user.name}</div>
                    <div className="text-sm text-muted-foreground">Level {entry.user.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{entry.weeklyPoints}</div>
                    <div className="text-sm text-muted-foreground">pts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Recent Activities
            </CardTitle>
            <CardDescription>Your latest achievements and activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +{activity.points}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-500" />
            Available Rewards
          </CardTitle>
          <CardDescription>Redeem your points for exciting rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <div className="text-2xl mb-2">☕</div>
              <h4 className="font-semibold">Free Coffee</h4>
              <p className="text-sm text-muted-foreground mb-2">Campus cafeteria</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-orange-600">500 pts</span>
                <Button size="sm" variant="outline">Redeem</Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-semibold">Library Pass</h4>
              <p className="text-sm text-muted-foreground mb-2">Extended hours access</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">750 pts</span>
                <Button size="sm" variant="outline">Redeem</Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-2xl mb-2">🎫</div>
              <h4 className="font-semibold">Event Ticket</h4>
              <p className="text-sm text-muted-foreground mb-2">Campus cultural event</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-600">1000 pts</span>
                <Button size="sm" variant="outline">Redeem</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationDashboard;
