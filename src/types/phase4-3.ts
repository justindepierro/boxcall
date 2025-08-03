/**
 * BoxCall Phase 4.3 Advanced Features Type Definitions
 * Supporting React Native platform and real-time synchronization
 */

// Core data types
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  teamId: string;
  type: "practice" | "game" | "meeting" | "other";
  location?: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  participants: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamUpdate {
  id: string;
  type:
    | "roster_change"
    | "schedule_update"
    | "announcement"
    | "role_assignment";
  teamId: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  timestamp: Date;
  createdBy: string;
  urgency: "low" | "medium" | "high";
  targetRoles: UserRole[];
}

export interface UserState {
  userId: string;
  teams: TeamMembership[];
  preferences: UserPreferences;
  permissions: UserPermissions;
  lastActive: Date;
  notificationSettings: NotificationSettings;
  deviceInfo: DeviceInfo;
}

export interface GameUpdate {
  id: string;
  gameId: string;
  type: "score_update" | "play_call" | "timeout" | "injury" | "substitution";
  timestamp: Date;
  data: Record<string, unknown>;
  quarter: number;
  timeRemaining: string;
  homeScore: number;
  awayScore: number;
}

// Performance and analytics types
export interface PerformanceMetrics {
  playerId: string;
  timeframe: "week" | "month" | "season" | "career";
  statistics: PlayerStatistics;
  trends: PerformanceTrend[];
  comparisons: PlayerComparison[];
  recommendations: string[];
  lastUpdated: Date;
}

export interface EngagementMetrics {
  teamId: string;
  period: "day" | "week" | "month";
  activeUsers: number;
  totalUsers: number;
  sessionDuration: number;
  featureUsage: FeatureUsage[];
  retentionRate: number;
  communicationMetrics: CommunicationMetrics;
}

export interface CoachingInsights {
  coachId: string;
  teamPerformance: TeamPerformanceInsight[];
  playerDevelopment: PlayerDevelopmentInsight[];
  formationEffectiveness: FormationInsight[];
  gameStrategy: StrategyInsight[];
  recommendedActions: RecommendedAction[];
  generatedAt: Date;
}

// Supporting types
export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval: number;
  daysOfWeek?: number[];
  endDate?: Date;
  occurrences?: number;
  exceptions: Date[];
}

export type UserRole =
  | "coach"
  | "assistant_coach"
  | "player"
  | "parent"
  | "family"
  | "admin";

export interface TeamMembership {
  teamId: string;
  teamName: string;
  role: UserRole;
  joinedAt: Date;
  isActive: boolean;
  permissions: string[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  dateFormat: string;
  notifications: boolean;
  calendarView: "month" | "week" | "day" | "list";
}

export interface UserPermissions {
  canEditCalendar: boolean;
  canManageRoster: boolean;
  canSendAnnouncements: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  customPermissions: string[];
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  calendarReminders: boolean;
  gameUpdates: boolean;
  announcements: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface DeviceInfo {
  platform: "web" | "ios" | "android";
  deviceId: string;
  appVersion: string;
  osVersion: string;
  lastSeen: Date;
}

export interface PlayerStatistics {
  gamesPlayed: number;
  practicesAttended: number;
  position: string;
  jerseyNumber: number;
  height: number;
  weight: number;
  customStats: Record<string, number>;
}

export interface PerformanceTrend {
  metric: string;
  direction: "up" | "down" | "stable";
  changePercentage: number;
  timeframe: string;
}

export interface PlayerComparison {
  metric: string;
  playerValue: number;
  teamAverage: number;
  positionAverage: number;
  rank: number;
}

export interface FeatureUsage {
  feature: string;
  usageCount: number;
  uniqueUsers: number;
  averageSessionTime: number;
}

export interface CommunicationMetrics {
  messagesExchanged: number;
  averageResponseTime: number;
  participationRate: number;
  announcementEngagement: number;
}

export interface TeamPerformanceInsight {
  category: string;
  metric: string;
  value: number;
  trend: "improving" | "declining" | "stable";
  recommendation: string;
}

export interface PlayerDevelopmentInsight {
  playerId: string;
  playerName: string;
  strengths: string[];
  areasForImprovement: string[];
  developmentPlan: string[];
  progressRating: number;
}

export interface FormationInsight {
  formation: string;
  successRate: number;
  useCount: number;
  effectiveness: "high" | "medium" | "low";
  recommendedSituations: string[];
}

export interface StrategyInsight {
  strategy: string;
  winRate: number;
  situationalUse: string[];
  playerRequirements: string[];
  recommendation: string;
}

export interface RecommendedAction {
  type: "training" | "strategy" | "roster" | "communication";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  expectedImpact: string;
  timeframe: string;
}

// Dashboard specific types
export interface CoachDashboard {
  teams: TeamSummary[];
  upcomingEvents: CalendarEvent[];
  recentUpdates: TeamUpdate[];
  performanceOverview: PerformanceOverview;
  quickActions: QuickAction[];
  notifications: DashboardNotification[];
}

export interface PlayerDashboard {
  teams: TeamSummary[];
  schedule: CalendarEvent[];
  personalStats: PerformanceMetrics;
  assignments: Assignment[];
  achievements: Achievement[];
  quickActions: QuickAction[];
}

export interface FamilyDashboard {
  children: PlayerSummary[];
  familySchedule: CalendarEvent[];
  teamUpdates: TeamUpdate[];
  transportationInfo: TransportationInfo[];
  paymentStatus: PaymentStatus[];
  quickActions: QuickAction[];
}

export interface TeamSummary {
  id: string;
  name: string;
  sport: string;
  division: string;
  season: string;
  record: GameRecord;
  nextEvent: CalendarEvent | null;
  memberCount: number;
  userRole: UserRole;
}

export interface PerformanceOverview {
  teamStats: TeamStatistics;
  playerHighlights: PlayerHighlight[];
  recentGames: GameSummary[];
  upcomingChallenges: string[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  requiresConfirmation: boolean;
  roles: UserRole[];
}

export interface DashboardNotification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actions: NotificationAction[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "completed" | "overdue";
  type: "training" | "academic" | "team_responsibility";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: "athletic" | "academic" | "leadership" | "team";
}

export interface PlayerSummary {
  id: string;
  name: string;
  teams: string[];
  position: string;
  jerseyNumber: number;
  currentStatus: "active" | "injured" | "suspended" | "inactive";
}

export interface TransportationInfo {
  eventId: string;
  eventTitle: string;
  date: Date;
  pickupTime: string;
  pickupLocation: string;
  dropoffTime: string;
  dropoffLocation: string;
  driver: string;
  contact: string;
}

export interface PaymentStatus {
  id: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "paid" | "pending" | "overdue";
  paymentMethod: string;
}

export interface GameRecord {
  wins: number;
  losses: number;
  ties: number;
  gamesPlayed: number;
}

export interface TeamStatistics {
  totalGames: number;
  winPercentage: number;
  averageScore: number;
  topPerformers: string[];
  recentTrends: string[];
}

export interface PlayerHighlight {
  playerId: string;
  playerName: string;
  achievement: string;
  value: string;
  context: string;
}

export interface GameSummary {
  id: string;
  opponent: string;
  date: Date;
  result: "win" | "loss" | "tie";
  score: string;
  highlights: string[];
}

export interface NotificationAction {
  id: string;
  label: string;
  action: string;
  style: "primary" | "secondary" | "danger";
}

// React Native specific types
export interface ReactNativeConfig {
  apiBaseUrl: string;
  syncInterval: number;
  offlineMode: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  cacheTimeout: number;
}

export interface PlatformCapabilities {
  hasCamera: boolean;
  hasGPS: boolean;
  canSendSMS: boolean;
  canMakeCall: boolean;
  hasFingerprint: boolean;
  hasFaceId: boolean;
  supportsPushNotifications: boolean;
}

// Error types
export class BoxCallError extends Error {
  public code: string;
  public status?: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "BoxCallError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class SyncError extends BoxCallError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "SYNC_ERROR", 500, details);
    this.name = "SyncError";
  }
}

export class AuthenticationError extends BoxCallError {
  constructor(message: string) {
    super(message, "AUTH_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class PermissionError extends BoxCallError {
  constructor(message: string) {
    super(message, "PERMISSION_ERROR", 403);
    this.name = "PermissionError";
  }
}
