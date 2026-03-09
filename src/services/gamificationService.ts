export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'rides' | 'environment' | 'social' | 'streak' | 'exploration' | 'safety';
  type: 'counter' | 'streak' | 'milestone' | 'special';
  icon: string;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  requirements: {
    target: number;
    metric: string;
    timeframe?: string;
  };
  rewards: Array<{
    type: 'points' | 'badge' | 'discount' | 'unlock';
    value: number | string;
    description: string;
  }>;
  isActive: boolean;
  createdAt: Date;
}

export interface UserProfile {
  userId: string;
  level: number;
  experience: number;
  points: number;
  streak: {
    current: number;
    longest: number;
    lastActivity: Date;
  };
  stats: {
    totalRides: number;
    totalDistance: number;
    totalTime: number;
    carbonSaved: number;
    moneySaved: number;
    routesExplored: number;
    friendsReferred: number;
  };
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
  }>;
  achievements: UserAchievement[];
  leaderboardPosition: number;
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  points: number;
  position: number;
  stats: {
    rides: number;
    distance: number;
    carbonSaved: number;
  };
  badges: number;
  achievements: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'rides' | 'environment' | 'social' | 'exploration';
  startDate: Date;
  endDate: Date;
  requirements: {
    target: number;
    metric: string;
    description: string;
  };
  rewards: Array<{
    type: 'points' | 'badge' | 'discount' | 'unlock';
    value: number | string;
    description: string;
  }>;
  participants: number;
  isActive: boolean;
  isParticipating: boolean;
  progress: number;
}

export interface ReferralProgram {
  id: string;
  referrerId: string;
  referredId: string;
  status: 'pending' | 'completed' | 'expired';
  rewards: {
    referrer: Array<{
      type: 'points' | 'discount' | 'unlock';
      value: number | string;
      description: string;
    }>;
    referred: Array<{
      type: 'points' | 'discount' | 'unlock';
      value: number | string;
      description: string;
    }>;
  };
  createdAt: Date;
  completedAt?: Date;
}

class GamificationService {
  private baseUrl = '/api/gamification';

  // User profile
  async getUserProfile(): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }

  async updateUserStats(stats: Partial<UserProfile['stats']>): Promise<UserProfile> {
    const response = await fetch(`${this.baseUrl}/profile/stats`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(stats),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user stats');
    }
    
    return response.json();
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    const response = await fetch(`${this.baseUrl}/achievements`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch achievements');
    }
    
    return response.json();
  }

  async getUserAchievements(): Promise<UserAchievement[]> {
    const response = await fetch(`${this.baseUrl}/achievements/user`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user achievements');
    }
    
    return response.json();
  }

  async checkAchievementProgress(achievementId: string, progress: number): Promise<UserAchievement | null> {
    const response = await fetch(`${this.baseUrl}/achievements/${achievementId}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ progress }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to check achievement progress');
    }
    
    return response.json();
  }

  // Leaderboards
  async getLeaderboard(type: 'points' | 'rides' | 'distance' | 'carbon' = 'points', limit = 50): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${this.baseUrl}/leaderboard?type=${type}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch leaderboard');
    }
    
    return response.json();
  }

  async getUserLeaderboardPosition(): Promise<{ position: number; totalUsers: number }> {
    const response = await fetch(`${this.baseUrl}/leaderboard/position`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user leaderboard position');
    }
    
    return response.json();
  }

  // Challenges
  async getChallenges(): Promise<Challenge[]> {
    const response = await fetch(`${this.baseUrl}/challenges`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch challenges');
    }
    
    return response.json();
  }

  async joinChallenge(challengeId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/challenges/${challengeId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to join challenge');
    }
  }

  async updateChallengeProgress(challengeId: string, progress: number): Promise<Challenge> {
    const response = await fetch(`${this.baseUrl}/challenges/${challengeId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ progress }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update challenge progress');
    }
    
    return response.json();
  }

  // Referral program
  async getReferralCode(): Promise<{ code: string; url: string }> {
    const response = await fetch(`${this.baseUrl}/referral/code`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch referral code');
    }
    
    return response.json();
  }

  async getReferralStats(): Promise<{
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
  }> {
    const response = await fetch(`${this.baseUrl}/referral/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch referral stats');
    }
    
    return response.json();
  }

  async processReferral(referralCode: string): Promise<ReferralProgram> {
    const response = await fetch(`${this.baseUrl}/referral/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ referralCode }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process referral');
    }
    
    return response.json();
  }

  // Ride tracking and rewards
  async trackRide(rideData: {
    routeId: string;
    distance: number;
    duration: number;
    carbonSaved: number;
    moneySaved: number;
  }): Promise<{
    pointsEarned: number;
    achievements: UserAchievement[];
    levelUp?: { newLevel: number; rewards: any[] };
  }> {
    const response = await fetch(`${this.baseUrl}/track-ride`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(rideData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to track ride');
    }
    
    return response.json();
  }

  // Utility functions
  calculateLevel(experience: number): number {
    // Level formula: level = floor(sqrt(experience / 100))
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  calculateExperienceForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
  }

  calculateExperienceToNextLevel(currentExperience: number): number {
    const currentLevel = this.calculateLevel(currentExperience);
    const nextLevelExperience = this.calculateExperienceForLevel(currentLevel + 1);
    return nextLevelExperience - currentExperience;
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'uncommon': return 'text-green-600 bg-green-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'rides': return '🚌';
      case 'environment': return '🌱';
      case 'social': return '👥';
      case 'streak': return '🔥';
      case 'exploration': return '🗺️';
      case 'safety': return '🛡️';
      default: return '🏆';
    }
  }

  formatPoints(points: number): string {
    if (points >= 1000000) {
      return `${(points / 1000000).toFixed(1)}M`;
    }
    if (points >= 1000) {
      return `${(points / 1000).toFixed(1)}K`;
    }
    return points.toString();
  }

  formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)} km`;
    }
    return `${distance.toFixed(0)} m`;
  }

  formatCarbonSaved(carbon: number): string {
    return `${carbon.toFixed(2)} kg CO₂`;
  }

  formatMoneySaved(money: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(money);
  }

  // Badge system
  async getBadges(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    isEarned: boolean;
    earnedAt?: Date;
  }>> {
    const response = await fetch(`${this.baseUrl}/badges`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch badges');
    }
    
    return response.json();
  }

  // Social features
  async getFriends(): Promise<Array<{
    userId: string;
    username: string;
    avatar?: string;
    level: number;
    points: number;
    isOnline: boolean;
    lastActivity: Date;
  }>> {
    const response = await fetch(`${this.baseUrl}/friends`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch friends');
    }
    
    return response.json();
  }

  async addFriend(userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add friend');
    }
  }

  async getFriendActivity(): Promise<Array<{
    userId: string;
    username: string;
    activity: string;
    timestamp: Date;
    points?: number;
  }>> {
    const response = await fetch(`${this.baseUrl}/friends/activity`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch friend activity');
    }
    
    return response.json();
  }

  // Analytics
  async getGamificationStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalPoints: number;
    totalAchievements: number;
    averageLevel: number;
    topAchievements: Array<{
      id: string;
      name: string;
      earnedCount: number;
    }>;
  }> {
    const response = await fetch(`${this.baseUrl}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch gamification stats');
    }
    
    return response.json();
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
