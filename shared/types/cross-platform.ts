/**
 * Phase 4.1: Cross-Platform Shared Services
 * 
 * Shared business logic and services that work across web, mobile, and PWA platforms.
 * This abstracts the Phase 3 intelligent features for cross-platform use.
 */

// ============================================================================
// CORE CROSS-PLATFORM TYPES
// ============================================================================

export interface Platform {
  type: 'web' | 'ios' | 'android' | 'pwa';
  version: string;
  capabilities: PlatformCapability[];
}

export interface PlatformCapability {
  name: string;
  supported: boolean;
  version?: string;
}

export interface CrossPlatformConfig {
  platform: Platform;
  apiEndpoint: string;
  realTimeEnabled: boolean;
  offlineEnabled: boolean;
  intelligentFeaturesEnabled: boolean;
}

// ============================================================================
// CROSS-PLATFORM CALENDAR TYPES
// ============================================================================

export interface CrossPlatformCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  type: 'practice' | 'game' | 'meeting' | 'event';
  teamId: string;
  createdBy: string;
  isRecurring: boolean;
  
  // Cross-platform specific fields
  syncedPlatforms: Platform['type'][];
  lastSyncTimestamp: Date;
  platformSpecificData?: Record<string, unknown>;
  
  // Phase 3 intelligent features
  conflicts?: ConflictDetection[];
  suggestions?: SchedulingSuggestion[];
  analytics?: EventAnalytics;
}

export interface ConflictDetection {
  id: string;
  type: 'team' | 'coach' | 'venue' | 'academic' | 'travel';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestions: string[];
  conflictingEvents: string[];
  autoResolvable: boolean;
}

export interface SchedulingSuggestion {
  id: string;
  suggestedTime: Date;
  confidence: number;
  reasons: string[];
  attendancePrediction: number;
  weatherScore?: number;
  optimizationFactors: OptimizationFactor[];
}

export interface OptimizationFactor {
  factor: string;
  weight: number;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface EventAnalytics {
  attendanceRate: number;
  attendanceTrend: 'improving' | 'declining' | 'stable';
  optimalTimingScore: number;
  performanceImpact: number;
  recommendations: string[];
}

// ============================================================================
// SYNC AND STATE MANAGEMENT
// ============================================================================

export interface SyncStatus {
  lastSync: Date;
  syncInProgress: boolean;
  pendingChanges: number;
  conflictsToResolve: number;
  syncErrors: SyncError[];
}

export interface SyncError {
  id: string;
  type: 'network' | 'conflict' | 'validation' | 'permission';
  message: string;
  timestamp: Date;
  retryable: boolean;
  retryCount: number;
}

export interface CrossPlatformState {
  user: UserState;
  teams: TeamState[];
  events: CrossPlatformCalendarEvent[];
  preferences: UserPreferences;
  sync: SyncStatus;
  intelligence: IntelligenceState;
}

export interface UserState {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'player' | 'parent' | 'coach' | 'admin';
  preferences: UserPreferences;
  platforms: Platform[];
  lastActiveTimestamp: Date;
}

export interface TeamState {
  id: string;
  name: string;
  sport: string;
  season: string;
  members: TeamMember[];
  settings: TeamSettings;
  intelligence: IntelligenceState; // Use existing IntelligenceState
}

export interface TeamMember {
  userId: string;
  role: 'player' | 'coach' | 'assistant' | 'parent';
  permissions: string[];
  joinedAt: Date;
  isActive: boolean;
}

export interface TeamSettings {
  timezone: string;
  defaultEventDuration: number;
  reminderSettings: ReminderSettings;
  intelligenceSettings: IntelligenceSettings;
  crossPlatformSync: boolean;
}

export interface ReminderSettings {
  enabled: boolean;
  defaultReminders: ReminderTiming[];
  customReminders: CustomReminder[];
  channels: NotificationChannel[];
}

export interface ReminderTiming {
  timing: number; // minutes before event
  eventTypes: string[];
  enabled: boolean;
}

export interface CustomReminder {
  id: string;
  name: string;
  timing: number;
  message: string;
  eventTypes: string[];
  channels: NotificationChannel[];
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'push' | 'inapp';
  enabled: boolean;
  address?: string; // email address, phone number, etc.
}

export interface IntelligenceSettings {
  conflictDetectionEnabled: boolean;
  smartSchedulingEnabled: boolean;
  attendanceAnalyticsEnabled: boolean;
  weatherIntegrationEnabled: boolean;
  academicCalendarSyncEnabled: boolean;
  performanceOptimizationEnabled: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  startOfWeek: 0 | 1; // Sunday or Monday
  defaultCalendarView: 'month' | 'week' | 'day' | 'agenda';
  intelligencePreferences: IntelligencePreferences;
  notificationPreferences: NotificationPreferences;
}

export interface IntelligencePreferences {
  autoAcceptSuggestions: boolean;
  suggestionConfidenceThreshold: number;
  showAnalyticsInCalendar: boolean;
  enablePredictiveFeatures: boolean;
  shareDataForImprovement: boolean;
}

export interface NotificationPreferences {
  enablePushNotifications: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  quietHours: QuietHours;
  urgencyLevels: UrgencyLevel[];
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  allowUrgent: boolean;
}

export interface UrgencyLevel {
  level: 'low' | 'medium' | 'high' | 'urgent';
  enabledChannels: NotificationChannel['type'][];
  respectQuietHours: boolean;
}

export interface IntelligenceState {
  conflictsDetected: ConflictDetection[];
  pendingSuggestions: SchedulingSuggestion[];
  analyticsCache: AnalyticsCache;
  learningData: LearningData;
  lastIntelligenceUpdate: Date;
}

export interface AnalyticsCache {
  teamAnalytics: Record<string, TeamAnalytics>;
  playerAnalytics: Record<string, PlayerAnalytics>;
  scheduleAnalytics: ScheduleAnalytics;
  cacheTimestamp: Date;
  cacheExpiry: Date;
}

export interface TeamAnalytics {
  attendanceRate: number;
  attendanceTrend: 'improving' | 'declining' | 'stable';
  optimalSchedulingScore: number;
  conflictRate: number;
  performanceMetrics: PerformanceMetrics;
}

export interface PlayerAnalytics {
  attendanceRate: number;
  punctualityScore: number;
  participationLevel: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  strengths: string[];
  areasForImprovement: string[];
}

export interface ScheduleAnalytics {
  optimalDays: string[];
  optimalTimes: number[];
  conflictHotspots: ConflictHotspot[];
  seasonalPatterns: SeasonalPattern[];
  weatherImpact: WeatherImpact;
}

export interface ConflictHotspot {
  timeSlot: string;
  conflictFrequency: number;
  conflictTypes: ConflictDetection['type'][];
  suggestions: string[];
}

export interface SeasonalPattern {
  period: string;
  attendancePattern: number[];
  conflictPattern: number[];
  insights: string[];
}

export interface WeatherImpact {
  weatherSensitivity: number;
  optimalWeatherConditions: string[];
  weatherBasedCancellations: number;
  seasonalWeatherPatterns: SeasonalWeatherPattern[];
}

export interface SeasonalWeatherPattern {
  season: string;
  averageImpact: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface PerformanceMetrics {
  practiceEfficiency: number;
  gamePerformance: number;
  teamCohesion: number;
  improvementRate: number;
  benchmarks: PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  metric: string;
  current: number;
  target: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

export interface LearningData {
  userBehaviorPatterns: UserBehaviorPattern[];
  teamPatterns: TeamPattern[];
  scheduleOptimizations: ScheduleOptimization[];
  predictionAccuracy: PredictionAccuracy;
}

export interface UserBehaviorPattern {
  userId: string;
  pattern: string;
  frequency: number;
  confidence: number;
  lastObserved: Date;
}

export interface TeamPattern {
  teamId: string;
  pattern: string;
  strength: number;
  applicableScenarios: string[];
  discoveredAt: Date;
}

export interface ScheduleOptimization {
  optimizationType: string;
  successRate: number;
  applicableConditions: string[];
  implementationSuggestions: string[];
}

export interface PredictionAccuracy {
  attendancePredictions: number;
  conflictPredictions: number;
  weatherPredictions: number;
  performancePredictions: number;
  overallAccuracy: number;
  lastCalculated: Date;
}

// ============================================================================
// TYPES ARE EXPORTED ABOVE - NO NEED FOR RE-EXPORT
// ============================================================================
