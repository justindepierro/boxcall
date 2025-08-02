/**
 * Phase 3: Intelligent Features - Attendance Analytics Service
 * 
 * Provides intelligent attendance tracking, analytics, and predictive modeling
 * to help teams optimize participation and engagement.
 */

import { supabase } from '../../lib/supabase';

// Define User interface for this service
export interface User {
  id: string;
  first_name: string;
  last_name: string;
}

// Define CalendarEvent interface for this service
export interface CalendarEvent {
  id: string;
  team_id: string;
  event_type: 'practice' | 'game' | 'meeting' | 'tournament';
  start_time: string;
  end_time: string;
  title: string;
  location?: string;
  created_at: string;
}

// Types for attendance analytics
export interface AttendanceRecord {
  id: string;
  eventId: string;
  userId: string;
  status: 'present' | 'absent' | 'late' | 'excused' | 'no_response';
  checkInTime?: Date;
  notes?: string;
  createdAt: Date;
}

export interface AttendanceAnalytics {
  teamId: string;
  period: 'week' | 'month' | 'season' | 'all_time';
  overallAttendanceRate: number;
  totalEvents: number;
  totalAttendees: number;
  averagePerEvent: number;
  trends: AttendanceTrend[];
  playerAnalytics: PlayerAttendanceAnalytics[];
  eventTypeAnalytics: EventTypeAnalytics[];
  recommendations: string[];
}

export interface AttendanceTrend {
  date: Date;
  attendanceRate: number;
  totalEvents: number;
  averageAttendance: number;
  weeklyChange: number;
}

export interface PlayerAttendanceAnalytics {
  userId: string;
  playerName: string;
  attendanceRate: number;
  totalEvents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  lastEvent?: Date;
  consistencyScore: number;
}

export interface EventTypeAnalytics {
  eventType: 'practice' | 'game' | 'meeting' | 'tournament';
  averageAttendance: number;
  attendanceRate: number;
  totalEvents: number;
  bestDay: string;
  bestTime: number;
  worstDay: string;
  worstTime: number;
}

export interface AttendancePrediction {
  eventId: string;
  eventDate: Date;
  predictedAttendance: number;
  confidence: number;
  factors: PredictionFactor[];
  riskFactors: string[];
  recommendations: string[];
}

export interface PredictionFactor {
  factor: 'day_of_week' | 'time_of_day' | 'weather' | 'academic' | 'historical' | 'seasonal';
  impact: number; // -1 to 1
  description: string;
}

export interface AttendanceInsights {
  bestDays: string[];
  bestTimes: number[];
  optimalEventTypes: string[];
  seasonalPatterns: SeasonalPattern[];
  playerEngagementInsights: PlayerEngagementInsight[];
  improvementOpportunities: ImprovementOpportunity[];
}

export interface SeasonalPattern {
  month: string;
  attendanceRate: number;
  commonFactors: string[];
  recommendations: string[];
}

export interface PlayerEngagementInsight {
  userId: string;
  playerName: string;
  engagementLevel: 'high' | 'medium' | 'low';
  motivatingFactors: string[];
  concerns: string[];
  recommendations: string[];
}

export interface ImprovementOpportunity {
  category: 'scheduling' | 'communication' | 'engagement' | 'logistics';
  description: string;
  potentialImpact: number; // 0-1
  effort: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface AttendanceQuery {
  teamId: string;
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  playerIds?: string[];
  includeExcused?: boolean;
}

/**
 * Attendance Analytics Service
 * Provides comprehensive attendance tracking and predictive analytics
 */
export class AttendanceAnalyticsService {
  
  // ==========================================
  // Core Analytics Engine
  // ==========================================
  
  /**
   * Get comprehensive attendance analytics for a team
   */
  static async getAttendanceAnalytics(
    teamId: string,
    period: 'week' | 'month' | 'season' | 'all_time' = 'month'
  ): Promise<AttendanceAnalytics> {
    try {
      const dateRange = this.getDateRangeForPeriod(period);
      
      // Get attendance records for the period
      const { data: attendanceRecords, error: attendanceError } = await supabase
        .from('attendance_records')
        .select(`
          *,
          calendar_events(*),
          users(id, first_name, last_name)
        `)
        .eq('calendar_events.team_id', teamId)
        .gte('calendar_events.start_time', dateRange.start.toISOString())
        .lte('calendar_events.start_time', dateRange.end.toISOString());
      
      if (attendanceError) throw attendanceError;
      
      // Get all events for the period
      const { data: events, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('team_id', teamId)
        .gte('start_time', dateRange.start.toISOString())
        .lte('start_time', dateRange.end.toISOString());
      
      if (eventsError) throw eventsError;
      
      const records = attendanceRecords || [];
      const teamEvents = events || [];
      
      // Calculate overall metrics
      const totalEvents = teamEvents.length;
      const presentRecords = records.filter(r => r.status === 'present');
      const totalAttendees = presentRecords.length;
      const teamSize = await this.getTeamSize(teamId);
      const overallAttendanceRate = totalEvents > 0 ? totalAttendees / (totalEvents * teamSize) : 0;
      const averagePerEvent = totalEvents > 0 ? totalAttendees / totalEvents : 0;
      
      // Generate analytics components
      const [
        trends,
        playerAnalytics,
        eventTypeAnalytics,
        recommendations
      ] = await Promise.all([
        this.calculateAttendanceTrends(records, teamEvents, period),
        this.generatePlayerAnalytics(records, teamId, dateRange),
        this.analyzeEventTypes(records, teamEvents),
        this.generateRecommendations(records, teamEvents, teamId)
      ]);
      
      return {
        teamId,
        period,
        overallAttendanceRate,
        totalEvents,
        totalAttendees,
        averagePerEvent,
        trends,
        playerAnalytics,
        eventTypeAnalytics,
        recommendations
      };
      
    } catch (error) {
      console.error('Error getting attendance analytics:', error);
      throw new Error('Failed to get attendance analytics');
    }
  }
  
  /**
   * Predict attendance for future events
   */
  static async predictAttendance(
    teamId: string,
    eventId: string
  ): Promise<AttendancePrediction> {
    try {
      // Get event details
      const { data: event, error: eventError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (eventError) throw eventError;
      
      // Get historical attendance data
      const historicalData = await this.getHistoricalAttendanceData(teamId);
      
      // Analyze prediction factors
      const factors = await this.analyzePredictionFactors(event, historicalData);
      
      // Calculate predicted attendance
      const baseAttendance = this.getAverageAttendanceForTeam(teamId);
      let predictedAttendance = baseAttendance;
      let confidence = 0.5;
      
      // Apply factors
      for (const factor of factors) {
        predictedAttendance += factor.impact * 5; // Adjust by up to 5 people per factor
        confidence += Math.abs(factor.impact) * 0.1;
      }
      
      // Normalize
      predictedAttendance = Math.max(0, Math.min(await this.getTeamSize(teamId), predictedAttendance));
      confidence = Math.max(0.1, Math.min(1, confidence));
      
      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(event, factors);
      
      // Generate recommendations
      const recommendations = this.generatePredictionRecommendations(factors, riskFactors);
      
      return {
        eventId,
        eventDate: new Date(event.start_time),
        predictedAttendance: Math.round(predictedAttendance),
        confidence,
        factors,
        riskFactors,
        recommendations
      };
      
    } catch (error) {
      console.error('Error predicting attendance:', error);
      throw new Error('Failed to predict attendance');
    }
  }
  
  /**
   * Get comprehensive attendance insights
   */
  static async getAttendanceInsights(teamId: string): Promise<AttendanceInsights> {
    try {
      const analytics = await this.getAttendanceAnalytics(teamId, 'season');
      
      // Extract best performing patterns
      const bestDays = this.extractBestDays(analytics.eventTypeAnalytics);
      const bestTimes = this.extractBestTimes(analytics.eventTypeAnalytics);
      const optimalEventTypes = this.extractOptimalEventTypes(analytics.eventTypeAnalytics);
      
      // Generate seasonal patterns
      const seasonalPatterns = await this.analyzeSeasonalPatterns(teamId);
      
      // Player engagement insights
      const playerEngagementInsights = await this.generatePlayerEngagementInsights(analytics.playerAnalytics);
      
      // Improvement opportunities
      const improvementOpportunities = this.identifyImprovementOpportunities(analytics);
      
      return {
        bestDays,
        bestTimes,
        optimalEventTypes,
        seasonalPatterns,
        playerEngagementInsights,
        improvementOpportunities
      };
      
    } catch (error) {
      console.error('Error getting attendance insights:', error);
      throw new Error('Failed to get attendance insights');
    }
  }
  
  // ==========================================
  // Analytics Calculation Methods
  // ==========================================
  
  /**
   * Calculate attendance trends over time
   */
  static async calculateAttendanceTrends(
    records: AttendanceRecord[],
    events: CalendarEvent[],
    period: 'week' | 'month' | 'season' | 'all_time'
  ): Promise<AttendanceTrend[]> {
    const trends: AttendanceTrend[] = [];
    const groupSize = this.getGroupSizeForPeriod(period);
    
    // Group events by time period
    const groupedEvents = this.groupEventsByPeriod(events, groupSize);
    
    for (const [dateKey, periodEvents] of groupedEvents) {
      const periodRecords = records.filter(r => 
        periodEvents.some(e => e.id === r.eventId)
      );
      
      const presentCount = periodRecords.filter(r => r.status === 'present').length;
      const totalPossible = periodEvents.length * await this.getTeamSize(periodEvents[0]?.team_id || '');
      const attendanceRate = totalPossible > 0 ? presentCount / totalPossible : 0;
      
      trends.push({
        date: new Date(dateKey),
        attendanceRate,
        totalEvents: periodEvents.length,
        averageAttendance: periodEvents.length > 0 ? presentCount / periodEvents.length : 0,
        weeklyChange: 0 // Would calculate based on previous period
      });
    }
    
    // Calculate weekly changes
    for (let i = 1; i < trends.length; i++) {
      trends[i].weeklyChange = trends[i].attendanceRate - trends[i - 1].attendanceRate;
    }
    
    return trends.sort((a, b) => a.date.getTime() - b.date.getTime());
  }
  
  /**
   * Generate individual player analytics
   */
  static async generatePlayerAnalytics(
    records: AttendanceRecord[],
    teamId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<PlayerAttendanceAnalytics[]> {
    // Get team members
    const { data: teamMembers, error } = await supabase
      .from('team_members')
      .select('user_id, users(id, first_name, last_name)')
      .eq('team_id', teamId);
    
    if (error) throw error;
    
    const analytics: PlayerAttendanceAnalytics[] = [];
    
    for (const member of teamMembers || []) {
      const playerRecords = records.filter(r => r.userId === member.user_id);
      const totalEvents = await this.getPlayerEventCount(member.user_id, teamId, dateRange);
      
      const presentCount = playerRecords.filter(r => r.status === 'present').length;
      const absentCount = playerRecords.filter(r => r.status === 'absent').length;
      const lateCount = playerRecords.filter(r => r.status === 'late').length;
      
      const attendanceRate = totalEvents > 0 ? presentCount / totalEvents : 0;
      const trend = this.calculateAttendanceTrend(playerRecords);
      const riskLevel = this.calculateRiskLevel(attendanceRate, trend);
      const consistencyScore = this.calculateConsistencyScore(playerRecords);
      
      analytics.push({
        userId: member.user_id,
        playerName: `${(member.users as unknown as User)?.first_name || 'Unknown'} ${(member.users as unknown as User)?.last_name || 'Player'}`,
        attendanceRate,
        totalEvents,
        presentCount,
        absentCount,
        lateCount,
        trend,
        riskLevel,
        lastEvent: playerRecords.length > 0 ? 
          new Date(Math.max(...playerRecords.map(r => new Date(r.createdAt).getTime()))) : 
          undefined,
        consistencyScore
      });
    }
    
    return analytics.sort((a, b) => b.attendanceRate - a.attendanceRate);
  }
  
  /**
   * Analyze attendance by event type
   */
  static async analyzeEventTypes(
    records: AttendanceRecord[],
    events: CalendarEvent[]
  ): Promise<EventTypeAnalytics[]> {
    const eventTypes = ['practice', 'game', 'meeting', 'tournament'] as const;
    const analytics: EventTypeAnalytics[] = [];
    
    for (const eventType of eventTypes) {
      const typeEvents = events.filter(e => e.event_type === eventType);
      const typeRecords = records.filter(r => 
        typeEvents.some(e => e.id === r.eventId)
      );
      
      if (typeEvents.length === 0) continue;
      
      const presentCount = typeRecords.filter(r => r.status === 'present').length;
      const averageAttendance = typeEvents.length > 0 ? presentCount / typeEvents.length : 0;
      const totalPossible = typeEvents.length * 20; // Assume 20 team members
      const attendanceRate = totalPossible > 0 ? presentCount / totalPossible : 0;
      
      // Analyze best/worst days and times
      const dayAnalysis = this.analyzeBestWorstDays(typeEvents, typeRecords);
      const timeAnalysis = this.analyzeBestWorstTimes(typeEvents, typeRecords);
      
      analytics.push({
        eventType,
        averageAttendance,
        attendanceRate,
        totalEvents: typeEvents.length,
        bestDay: dayAnalysis.bestDay,
        bestTime: timeAnalysis.bestTime,
        worstDay: dayAnalysis.worstDay,
        worstTime: timeAnalysis.worstTime
      });
    }
    
    return analytics;
  }
  
  // ==========================================
  // Helper Methods
  // ==========================================
  
  static getDateRangeForPeriod(period: 'week' | 'month' | 'season' | 'all_time') {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'season':
        start.setMonth(end.getMonth() - 4); // 4 months
        break;
      case 'all_time':
        start.setFullYear(end.getFullYear() - 2); // 2 years
        break;
    }
    
    return { start, end };
  }
  
  static getGroupSizeForPeriod(period: 'week' | 'month' | 'season' | 'all_time'): 'day' | 'week' | 'month' {
    switch (period) {
      case 'week': return 'day';
      case 'month': return 'week';
      case 'season': return 'week';
      case 'all_time': return 'month';
    }
  }
  
  static groupEventsByPeriod(events: CalendarEvent[], groupSize: 'day' | 'week' | 'month'): Map<string, CalendarEvent[]> {
    const grouped = new Map<string, CalendarEvent[]>();
    
    for (const event of events) {
      const date = new Date(event.start_time);
      let key: string;
      
      switch (groupSize) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        }
        case 'month':
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          break;
      }
      
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(event);
    }
    
    return grouped;
  }
  
  // Mock implementations for data retrieval
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getTeamSize(_teamId: string): Promise<number> {
    return 20; // Mock team size
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getHistoricalAttendanceData(_teamId: string): Promise<AttendanceRecord[]> {
    return []; // Mock historical data
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async analyzePredictionFactors(_event: CalendarEvent, _historicalData: AttendanceRecord[]): Promise<PredictionFactor[]> {
    return [
      {
        factor: 'day_of_week',
        impact: 0.1,
        description: 'Tuesday practices have 10% higher attendance'
      }
    ];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getAverageAttendanceForTeam(_teamId: string): number {
    return 15; // Mock average attendance
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static identifyRiskFactors(_event: CalendarEvent, _factors: PredictionFactor[]): string[] {
    return ['Weather conditions may affect attendance'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generatePredictionRecommendations(_factors: PredictionFactor[], _riskFactors: string[]): string[] {
    return ['Send reminder notifications 24 hours before event'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async generateRecommendations(_records: AttendanceRecord[], _events: CalendarEvent[], _teamId: string): Promise<string[]> {
    return ['Consider scheduling more practices on high-attendance days'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getPlayerEventCount(_userId: string, _teamId: string, _dateRange: { start: Date; end: Date }): Promise<number> {
    return 10; // Mock event count
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static calculateAttendanceTrend(_records: AttendanceRecord[]): 'improving' | 'declining' | 'stable' {
    return 'stable';
  }
  
  static calculateRiskLevel(attendanceRate: number, trend: 'improving' | 'declining' | 'stable'): 'low' | 'medium' | 'high' {
    if (attendanceRate < 0.6 || trend === 'declining') return 'high';
    if (attendanceRate < 0.8) return 'medium';
    return 'low';
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static calculateConsistencyScore(_records: AttendanceRecord[]): number {
    return 0.8; // Mock consistency score
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static analyzeBestWorstDays(_events: CalendarEvent[], _records: AttendanceRecord[]) {
    return { bestDay: 'Tuesday', worstDay: 'Friday' };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static analyzeBestWorstTimes(_events: CalendarEvent[], _records: AttendanceRecord[]) {
    return { bestTime: 16, worstTime: 19 };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static extractBestDays(_analytics: EventTypeAnalytics[]): string[] {
    return ['Tuesday', 'Wednesday', 'Thursday'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static extractBestTimes(_analytics: EventTypeAnalytics[]): number[] {
    return [16, 17, 18];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static extractOptimalEventTypes(_analytics: EventTypeAnalytics[]): string[] {
    return ['practice', 'game'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async analyzeSeasonalPatterns(_teamId: string): Promise<SeasonalPattern[]> {
    return [
      {
        month: 'September',
        attendanceRate: 0.85,
        commonFactors: ['School year start', 'Good weather'],
        recommendations: ['Maintain current schedule']
      }
    ];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async generatePlayerEngagementInsights(_playerAnalytics: PlayerAttendanceAnalytics[]): Promise<PlayerEngagementInsight[]> {
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static identifyImprovementOpportunities(_analytics: AttendanceAnalytics): ImprovementOpportunity[] {
    return [
      {
        category: 'scheduling',
        description: 'Optimize practice times for better attendance',
        potentialImpact: 0.15,
        effort: 'medium',
        actionItems: ['Analyze attendance patterns by time of day', 'Survey team for preferred times']
      }
    ];
  }
}

export default AttendanceAnalyticsService;
