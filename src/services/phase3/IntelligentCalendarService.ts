/**
 * Phase 3: Intelligent Features - Intelligent Calendar Service
 * 
 * Main orchestration service that provides intelligent calendar features
 * by coordinating conflict detection, smart scheduling, and attendance analytics.
 */

import { ConflictDetectionService, type ConflictDetectionRequest, type ConflictDetectionResult } from './ConflictDetectionService';
import { SmartSchedulingOptimizer, type SchedulingConstraints, type TimeSuggestion, type SchedulingInsights } from './SmartSchedulingOptimizer';
import { AttendanceAnalyticsService, type AttendanceAnalytics, type AttendancePrediction } from './AttendanceAnalyticsService';
import { supabase } from '../../lib/supabase';

// Types for intelligent calendar system
export interface IntelligentCalendarRequest {
  teamId: string;
  operation: 'create_event' | 'analyze_schedule' | 'optimize_timing' | 'predict_attendance';
  eventDetails?: {
    title: string;
    startTime: Date;
    endTime: Date;
    eventType: 'practice' | 'game' | 'meeting';
    location?: string;
    description?: string;
  };
  analysisOptions?: {
    includePredictions: boolean;
    includeOptimizations: boolean;
    includeConflictAnalysis: boolean;
    timeframe: 'week' | 'month' | 'season';
  };
}

export interface IntelligentCalendarResponse {
  success: boolean;
  operation: string;
  teamId: string;
  results: {
    conflicts?: ConflictDetectionResult;
    suggestions?: TimeSuggestion[];
    analytics?: AttendanceAnalytics;
    predictions?: AttendancePrediction[];
    insights?: SchedulingInsights;
    recommendations: string[];
  };
  warnings?: string[];
  errors?: string[];
  metadata: {
    timestamp: Date;
    processingTime: number;
    confidence: number;
  };
}

export interface SchedulingRecommendation {
  type: 'time_optimization' | 'conflict_avoidance' | 'attendance_improvement' | 'resource_optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: number; // 0-1 scale
  actionItems: string[];
  estimatedImprovement: string;
}

export interface IntelligentSchedulingSession {
  sessionId: string;
  teamId: string;
  startTime: Date;
  preferences: SchedulingConstraints;
  currentSuggestions: TimeSuggestion[];
  appliedOptimizations: string[];
  userFeedback: UserFeedback[];
  finalSelection?: TimeSuggestion;
}

export interface UserFeedback {
  suggestionId: string;
  rating: number; // 1-5
  comments?: string;
  selectedFactors: string[];
  timestamp: Date;
}

export interface SeasonOptimizationRequest {
  teamId: string;
  seasonStart: Date;
  seasonEnd: Date;
  practicesPerWeek: number;
  gameSchedule: Date[];
  constraints: SchedulingConstraints;
  priorities: OptimizationPriority[];
}

export interface OptimizationPriority {
  factor: 'attendance' | 'performance' | 'convenience' | 'weather' | 'academic';
  weight: number; // 0-1
}

export interface SeasonOptimizationResult {
  optimizedSchedule: OptimizedEvent[];
  improvements: {
    attendanceIncrease: number;
    conflictReduction: number;
    satisfactionScore: number;
  };
  alternatives: OptimizedEvent[][];
  seasonInsights: string[];
}

// Result types for intelligent operations
export interface EventCreationResult {
  conflicts?: ConflictDetectionResult;
  suggestions?: TimeSuggestion[];
  attendancePrediction?: AttendancePrediction;
  recommendations: string[];
}

export interface ScheduleAnalysisResult {
  analytics: AttendanceAnalytics;
  insights: SchedulingInsights;
  attendanceInsights: Record<string, unknown>; // Would be properly typed based on AttendanceInsights
  recommendations: string[];
}

export interface TimingOptimizationResult {
  optimizations: OptimizationItem[];
  totalEvents: number;
  optimizableEvents: number;
  recommendations: string[];
}

export interface OptimizationItem {
  eventId: string;
  currentTime: Date;
  suggestedTime: Date;
  confidence: number;
  reasons: string[];
  predictedImprovement: string;
}

export interface AttendancePredictionResult {
  predictions: AttendancePrediction[];
  summary: string;
  recommendations: string[];
}

export interface IntelligentResults {
  recommendations: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface OptimizedEvent {
  originalDate?: Date;
  suggestedDate: Date;
  eventType: 'practice' | 'game' | 'meeting';
  confidence: number;
  improvementReasons: string[];
  predictedAttendance: number;
  conflictRisk: 'low' | 'medium' | 'high';
}

/**
 * Intelligent Calendar Service
 * Orchestrates all Phase 3 intelligent features
 */
export class IntelligentCalendarService {
  
  // ==========================================
  // Core Intelligent Operations
  // ==========================================
  
  /**
   * Main entry point for intelligent calendar operations
   */
  static async processIntelligentRequest(request: IntelligentCalendarRequest): Promise<IntelligentCalendarResponse> {
    const startTime = Date.now();
    
    try {
      let results: IntelligentResults = { recommendations: [] };
      const warnings: string[] = [];
      
      switch (request.operation) {
        case 'create_event':
          results = await this.handleIntelligentEventCreation(request);
          break;
        case 'analyze_schedule':
          results = await this.handleScheduleAnalysis(request);
          break;
        case 'optimize_timing':
          results = await this.handleTimingOptimization(request);
          break;
        case 'predict_attendance':
          results = await this.handleAttendancePrediction(request);
          break;
        default:
          throw new Error(`Unknown operation: ${request.operation}`);
      }
      
      // Add intelligent recommendations
      const intelligentRecommendations = await this.generateIntelligentRecommendations(
        request.teamId,
        results
      );
      results.recommendations.push(...intelligentRecommendations);
      
      // Calculate confidence score
      const confidence = this.calculateOverallConfidence(results);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        operation: request.operation,
        teamId: request.teamId,
        results,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          timestamp: new Date(),
          processingTime,
          confidence
        }
      };
      
    } catch (error) {
      console.error('Error processing intelligent request:', error);
      
      return {
        success: false,
        operation: request.operation,
        teamId: request.teamId,
        results: { recommendations: [] },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          confidence: 0
        }
      };
    }
  }
  
  /**
   * Intelligent event creation with conflict detection and optimization
   */
  static async handleIntelligentEventCreation(request: IntelligentCalendarRequest): Promise<EventCreationResult> {
    if (!request.eventDetails) {
      throw new Error('Event details required for event creation');
    }
    
    const { eventDetails } = request;
    
    // Step 1: Detect conflicts
    const conflictRequest: ConflictDetectionRequest = {
      proposedEvent: {
        start: eventDetails.startTime.toISOString(),
        end: eventDetails.endTime.toISOString(),
        location: eventDetails.location
      },
      teamId: request.teamId,
      checkAcademicCalendar: true,
      checkVenueConflicts: true,
      checkFamilySchedules: true
    };
    
    const conflicts = await ConflictDetectionService.detectConflicts(conflictRequest);
    
    // Step 2: Get optimization suggestions if conflicts exist
    let suggestions: TimeSuggestion[] = [];
    if (conflicts.hasConflicts) {
      const constraints: SchedulingConstraints = {
        teamId: request.teamId,
        preferredDays: this.extractPreferredDays(eventDetails.startTime),
        preferredTimeSlots: this.extractPreferredTimeSlots(eventDetails.startTime),
        duration: this.calculateDuration(eventDetails.startTime, eventDetails.endTime),
        eventType: eventDetails.eventType,
        location: eventDetails.location,
        minimumNotice: 24,
        weatherSensitive: eventDetails.eventType === 'practice',
        academicCalendarRespect: true
      };
      
      suggestions = await SmartSchedulingOptimizer.suggestOptimalPracticeTime(
        request.teamId,
        constraints
      );
    }
    
    // Step 3: Predict attendance for the proposed time
    let attendancePrediction: AttendancePrediction | undefined;
    if (request.analysisOptions?.includePredictions) {
      // Create a temporary event ID for prediction
      const tempEventId = `temp_${Date.now()}`;
      attendancePrediction = await AttendanceAnalyticsService.predictAttendance(
        request.teamId,
        tempEventId
      );
    }
    
    return {
      conflicts,
      suggestions,
      attendancePrediction,
      recommendations: [
        ...conflicts.recommendations,
        ...(suggestions.length > 0 ? ['Consider alternative time slots to avoid conflicts'] : []),
        ...(attendancePrediction ? [`Expected attendance: ${attendancePrediction.predictedAttendance} players`] : [])
      ]
    };
  }
  
  /**
   * Comprehensive schedule analysis with insights
   */
  static async handleScheduleAnalysis(request: IntelligentCalendarRequest): Promise<ScheduleAnalysisResult> {
    const timeframe = request.analysisOptions?.timeframe || 'month';
    
    // Get attendance analytics
    const analytics = await AttendanceAnalyticsService.getAttendanceAnalytics(
      request.teamId,
      timeframe
    );
    
    // Get scheduling insights
    const insights = await SmartSchedulingOptimizer.learnFromHistoricalData(request.teamId);
    
    // Get attendance insights
    const attendanceInsights = await AttendanceAnalyticsService.getAttendanceInsights(request.teamId);
    
    // Generate comprehensive recommendations
    const recommendations = this.generateScheduleAnalysisRecommendations(
      analytics,
      insights,
      attendanceInsights as unknown as Record<string, unknown>
    );
    
    return {
      analytics,
      insights,
      attendanceInsights: attendanceInsights as unknown as Record<string, unknown>,
      recommendations
    };
  }
  
  /**
   * Timing optimization for existing events
   */
  static async handleTimingOptimization(request: IntelligentCalendarRequest): Promise<TimingOptimizationResult> {
    // Get upcoming events
    const { data: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('team_id', request.teamId)
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(10);
    
    const optimizations: OptimizationItem[] = [];
    
    if (upcomingEvents) {
      for (const event of upcomingEvents) {
        const constraints: SchedulingConstraints = {
          teamId: request.teamId,
          preferredDays: this.extractPreferredDays(new Date(event.start_time)),
          preferredTimeSlots: this.extractPreferredTimeSlots(new Date(event.start_time)),
          duration: this.calculateDuration(new Date(event.start_time), new Date(event.end_time)),
          eventType: event.event_type,
          location: event.location,
          minimumNotice: 24,
          weatherSensitive: event.event_type === 'practice',
          academicCalendarRespect: true
        };
        
        const suggestions = await SmartSchedulingOptimizer.suggestOptimalPracticeTime(
          request.teamId,
          constraints
        );
        
        if (suggestions.length > 0 && suggestions[0].confidence > 0.7) {
          optimizations.push({
            eventId: event.id,
            currentTime: new Date(event.start_time),
            suggestedTime: suggestions[0].dateTime,
            confidence: suggestions[0].confidence,
            reasons: suggestions[0].reasons,
            predictedImprovement: this.calculatePredictedImprovement(suggestions[0])
          });
        }
      }
    }
    
    return {
      optimizations,
      totalEvents: upcomingEvents?.length || 0,
      optimizableEvents: optimizations.length,
      recommendations: optimizations.length > 0 
        ? [`${optimizations.length} events can be optimized for better outcomes`]
        : ['Current schedule is well-optimized']
    };
  }
  
  /**
   * Attendance prediction for upcoming events
   */
  static async handleAttendancePrediction(request: IntelligentCalendarRequest): Promise<AttendancePredictionResult> {
    // Get upcoming events
    const { data: upcomingEvents } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('team_id', request.teamId)
      .gte('start_time', new Date().toISOString())
      .order('start_time')
      .limit(5);
    
    const predictions: AttendancePrediction[] = [];
    
    if (upcomingEvents) {
      for (const event of upcomingEvents) {
        try {
          const prediction = await AttendanceAnalyticsService.predictAttendance(
            request.teamId,
            event.id
          );
          predictions.push(prediction);
        } catch (error) {
          console.error(`Error predicting attendance for event ${event.id}:`, error);
        }
      }
    }
    
    return {
      predictions,
      summary: this.generateAttendancePredictionSummary(predictions),
      recommendations: this.generateAttendancePredictionRecommendations(predictions)
    };
  }
  
  // ==========================================
  // Season-Level Optimization
  // ==========================================
  
  /**
   * Optimize an entire season schedule
   */
  static async optimizeSeasonSchedule(request: SeasonOptimizationRequest): Promise<SeasonOptimizationResult> {
    try {
      // Use SmartSchedulingOptimizer for season-level optimization
      const seasonRequirements = {
        startDate: request.seasonStart,
        endDate: request.seasonEnd,
        practicesPerWeek: request.practicesPerWeek,
        gamesPerWeek: 1, // Default
        blackoutDates: [], // Would be provided
        specialEvents: [] // Would be provided
      };
      
      const optimizedSchedule = await SmartSchedulingOptimizer.optimizeSeasonSchedule(
        request.teamId,
        seasonRequirements
      );
      
      // Convert to our response format
      const optimizedEvents: OptimizedEvent[] = optimizedSchedule.events.map(event => ({
        originalDate: event.originalDateTime,
        suggestedDate: event.suggestedDateTime,
        eventType: 'practice', // Default
        confidence: event.confidence,
        improvementReasons: event.improvementReasons,
        predictedAttendance: event.expectedAttendance,
        conflictRisk: event.conflictRisk
      }));
      
      return {
        optimizedSchedule: optimizedEvents,
        improvements: {
          attendanceIncrease: optimizedSchedule.analytics.attendanceImprovement,
          conflictReduction: optimizedSchedule.analytics.conflictReduction,
          satisfactionScore: optimizedSchedule.overallScore
        },
        alternatives: [], // Would generate alternative schedules
        seasonInsights: optimizedSchedule.improvements
      };
      
    } catch (error) {
      console.error('Error optimizing season schedule:', error);
      throw new Error('Failed to optimize season schedule');
    }
  }
  
  // ==========================================
  // Helper Methods
  // ==========================================
  
  /**
   * Generate intelligent recommendations based on all available data
   */
  static async generateIntelligentRecommendations(teamId: string, results: IntelligentResults): Promise<string[]> {
    const recommendations: string[] = [];
    
    // Analyze conflicts
    if (results.conflicts?.hasConflicts) {
      recommendations.push('⚠️ Scheduling conflicts detected - consider alternative times');
    }
    
    // Analyze attendance predictions
    if (results.attendancePrediction) {
      const prediction = results.attendancePrediction;
      if (prediction.confidence > 0.8) {
        recommendations.push(`🎯 High confidence prediction: ${prediction.predictedAttendance} players expected`);
      }
    }
    
    // Analyze optimization opportunities
    if (results.optimizations && results.optimizations.length > 0) {
      recommendations.push(`⚡ ${results.optimizations.length} scheduling optimizations available`);
    }
    
    // Add team-specific insights
    try {
      const teamInsights = await this.getTeamSpecificInsights(teamId);
      recommendations.push(...teamInsights);
    } catch (error) {
      console.error('Error getting team insights:', error);
    }
    
    return recommendations;
  }
  
  /**
   * Calculate overall confidence score for the response
   */
  static calculateOverallConfidence(results: IntelligentResults): number {
    let totalConfidence = 0;
    let factorCount = 0;
    
    // Factor in conflict detection confidence
    if (results.conflicts) {
      totalConfidence += results.conflicts.hasConflicts ? 0.9 : 1.0;
      factorCount++;
    }
    
    // Factor in suggestion confidence
    if (results.suggestions && results.suggestions.length > 0) {
      const avgSuggestionConfidence = results.suggestions.reduce((sum: number, s: TimeSuggestion) => sum + s.confidence, 0) / results.suggestions.length;
      totalConfidence += avgSuggestionConfidence;
      factorCount++;
    }
    
    // Factor in prediction confidence
    if (results.attendancePrediction) {
      totalConfidence += results.attendancePrediction.confidence;
      factorCount++;
    }
    
    return factorCount > 0 ? totalConfidence / factorCount : 0.5;
  }
  
  // Helper methods with mock implementations
  static extractPreferredDays(date: Date): string[] {
    const dayIndex = date.getDay();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return [days[dayIndex]];
  }
  
  static extractPreferredTimeSlots(date: Date) {
    const hour = date.getHours();
    return [{
      day: 'tuesday',
      startHour: hour,
      endHour: hour + 2,
      priority: 'high' as const
    }];
  }
  
  static calculateDuration(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static calculatePredictedImprovement(_suggestion: TimeSuggestion): string {
    return '15% attendance increase expected';
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generateScheduleAnalysisRecommendations(_analytics: AttendanceAnalytics, _insights: SchedulingInsights, _attendanceInsights: Record<string, unknown>): string[] {
    return ['Consider optimizing practice times for better attendance'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generateAttendancePredictionSummary(_predictions: AttendancePrediction[]): string {
    return 'Overall attendance trend is positive';
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generateAttendancePredictionRecommendations(_predictions: AttendancePrediction[]): string[] {
    return ['Send reminders 24 hours before low-predicted attendance events'];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async getTeamSpecificInsights(_teamId: string): Promise<string[]> {
    return ['Team performs best with Tuesday/Thursday practices'];
  }
}

export default IntelligentCalendarService;
