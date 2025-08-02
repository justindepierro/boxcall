/**
 * Phase 3: Intelligent Features - React Hook
 * 
 * Main React hook for accessing Phase 3 intelligent calendar features.
 * Provides smart scheduling, conflict detection, and attendance analytics.
 */

import { useState, useCallback, useEffect } from 'react';
import { ConflictDetectionService, type ConflictDetectionRequest, type ConflictDetectionResult } from '../services/phase3/ConflictDetectionService';
import { SmartSchedulingOptimizer, type SchedulingConstraints, type TimeSuggestion, type SchedulingInsights } from '../services/phase3/SmartSchedulingOptimizer';
import { AttendanceAnalyticsService, type AttendanceAnalytics, type AttendancePrediction } from '../services/phase3/AttendanceAnalyticsService';
import { IntelligentCalendarService, type IntelligentCalendarRequest, type IntelligentCalendarResponse } from '../services/phase3/IntelligentCalendarService';

// Hook state interfaces
export interface IntelligentCalendarState {
  // Loading states
  isLoading: boolean;
  isDetectingConflicts: boolean;
  isGeneratingSuggestions: boolean;
  isAnalyzingAttendance: boolean;
  isOptimizingSchedule: boolean;
  
  // Data states
  conflicts: ConflictDetectionResult | null;
  suggestions: TimeSuggestion[];
  analytics: AttendanceAnalytics | null;
  insights: SchedulingInsights | null;
  predictions: AttendancePrediction[];
  
  // Error states
  error: string | null;
  conflictError: string | null;
  suggestionError: string | null;
  analyticsError: string | null;
  
  // UI states
  showConflictDetails: boolean;
  showOptimizationSuggestions: boolean;
  showAnalyticsDashboard: boolean;
}

export interface IntelligentCalendarHookOptions {
  teamId: string;
  autoLoadAnalytics?: boolean;
  autoLoadInsights?: boolean;
  enableRealTimeUpdates?: boolean;
  cacheTimeout?: number; // minutes
}

export interface ConflictCheckOptions {
  checkAcademicCalendar?: boolean;
  checkVenueConflicts?: boolean;
  checkFamilySchedules?: boolean;
  checkTravelTime?: boolean;
}

export interface SchedulingOptions {
  preferredDays?: string[];
  preferredTimes?: number[];
  duration?: number;
  eventType?: 'practice' | 'game' | 'meeting';
  location?: string;
  weatherSensitive?: boolean;
  minimumNotice?: number;
}

/**
 * Main hook for Phase 3 intelligent calendar features
 */
export const useIntelligentCalendar = (options: IntelligentCalendarHookOptions) => {
  // ==========================================
  // State Management
  // ==========================================
  
  const [state, setState] = useState<IntelligentCalendarState>({
    isLoading: false,
    isDetectingConflicts: false,
    isGeneratingSuggestions: false,
    isAnalyzingAttendance: false,
    isOptimizingSchedule: false,
    conflicts: null,
    suggestions: [],
    analytics: null,
    insights: null,
    predictions: [],
    error: null,
    conflictError: null,
    suggestionError: null,
    analyticsError: null,
    showConflictDetails: false,
    showOptimizationSuggestions: false,
    showAnalyticsDashboard: false
  });
  
  // ==========================================
  // Core Intelligent Functions
  // ==========================================
  
  /**
   * Detect conflicts for a proposed event
   */
  const detectConflicts = useCallback(async (
    proposedEvent: {
      startTime: Date;
      endTime: Date;
      location?: string;
    },
    checkOptions: ConflictCheckOptions = {}
  ): Promise<ConflictDetectionResult | null> => {
    setState(prev => ({ 
      ...prev, 
      isDetectingConflicts: true, 
      conflictError: null 
    }));
    
    try {
      const request: ConflictDetectionRequest = {
        proposedEvent,
        teamId: options.teamId,
        checkAcademicCalendar: checkOptions.checkAcademicCalendar ?? true,
        checkVenueConflicts: checkOptions.checkVenueConflicts ?? true,
        checkFamilySchedules: checkOptions.checkFamilySchedules ?? false,
      };
      
      const result = await ConflictDetectionService.detectConflicts(request);
      
      setState(prev => ({
        ...prev,
        conflicts: result,
        showConflictDetails: result.hasConflicts,
        isDetectingConflicts: false
      }));
      
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to detect conflicts';
      setState(prev => ({
        ...prev,
        conflictError: errorMessage,
        isDetectingConflicts: false
      }));
      return null;
    }
  }, [options.teamId]);
  
  /**
   * Generate smart scheduling suggestions
   */
  const generateSuggestions = useCallback(async (
    schedulingOptions: SchedulingOptions = {}
  ): Promise<TimeSuggestion[]> => {
    setState(prev => ({ 
      ...prev, 
      isGeneratingSuggestions: true, 
      suggestionError: null 
    }));
    
    try {
      const constraints: SchedulingConstraints = {
        teamId: options.teamId,
        preferredDays: schedulingOptions.preferredDays || ['tuesday', 'wednesday', 'thursday'],
        preferredTimeSlots: schedulingOptions.preferredTimes?.map(hour => ({
          day: 'tuesday',
          startHour: hour,
          endHour: hour + 2,
          priority: 'high' as const
        })) || [],
        duration: schedulingOptions.duration || 120,
        eventType: schedulingOptions.eventType || 'practice',
        location: schedulingOptions.location,
        minimumNotice: schedulingOptions.minimumNotice || 24,
        weatherSensitive: schedulingOptions.weatherSensitive ?? false,
        academicCalendarRespect: true
      };
      
      const suggestions = await SmartSchedulingOptimizer.suggestOptimalPracticeTime(
        options.teamId,
        constraints
      );
      
      setState(prev => ({
        ...prev,
        suggestions,
        showOptimizationSuggestions: suggestions.length > 0,
        isGeneratingSuggestions: false
      }));
      
      return suggestions;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
      setState(prev => ({
        ...prev,
        suggestionError: errorMessage,
        isGeneratingSuggestions: false
      }));
      return [];
    }
  }, [options.teamId]);
  
  /**
   * Get attendance analytics
   */
  const loadAnalytics = useCallback(async (
    period: 'week' | 'month' | 'season' | 'all_time' = 'month'
  ): Promise<AttendanceAnalytics | null> => {
    setState(prev => ({ 
      ...prev, 
      isAnalyzingAttendance: true, 
      analyticsError: null 
    }));
    
    try {
      const analytics = await AttendanceAnalyticsService.getAttendanceAnalytics(
        options.teamId,
        period
      );
      
      setState(prev => ({
        ...prev,
        analytics,
        showAnalyticsDashboard: true,
        isAnalyzingAttendance: false
      }));
      
      return analytics;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      setState(prev => ({
        ...prev,
        analyticsError: errorMessage,
        isAnalyzingAttendance: false
      }));
      return null;
    }
  }, [options.teamId]);
  
  /**
   * Get scheduling insights from historical data
   */
  const loadInsights = useCallback(async (): Promise<SchedulingInsights | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const insights = await SmartSchedulingOptimizer.learnFromHistoricalData(options.teamId);
      
      setState(prev => ({
        ...prev,
        insights,
        isLoading: false
      }));
      
      return insights;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load insights';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return null;
    }
  }, [options.teamId]);
  
  /**
   * Predict attendance for upcoming events
   */
  const predictAttendance = useCallback(async (eventId: string): Promise<AttendancePrediction | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const prediction = await AttendanceAnalyticsService.predictAttendance(
        options.teamId,
        eventId
      );
      
      setState(prev => ({
        ...prev,
        predictions: [...prev.predictions.filter(p => p.eventId !== eventId), prediction],
        isLoading: false
      }));
      
      return prediction;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to predict attendance';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return null;
    }
  }, [options.teamId]);
  
  /**
   * Process intelligent calendar request (unified operation)
   */
  const processIntelligentRequest = useCallback(async (
    request: IntelligentCalendarRequest
  ): Promise<IntelligentCalendarResponse | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await IntelligentCalendarService.processIntelligentRequest(request);
      
      // Update state based on the response
      if (response.results.conflicts) {
        setState(prev => ({ ...prev, conflicts: response.results.conflicts! }));
      }
      
      if (response.results.suggestions) {
        setState(prev => ({ ...prev, suggestions: response.results.suggestions! }));
      }
      
      if (response.results.analytics) {
        setState(prev => ({ ...prev, analytics: response.results.analytics! }));
      }
      
      if (response.results.predictions) {
        setState(prev => ({ ...prev, predictions: response.results.predictions! }));
      }
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      return response;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false
      }));
      return null;
    }
  }, []);
  
  // ==========================================
  // Convenience Functions
  // ==========================================
  
  /**
   * Quick conflict check and suggestion generation for event creation
   */
  const checkEventAndSuggest = useCallback(async (
    proposedEvent: {
      startTime: Date;
      endTime: Date;
      eventType: 'practice' | 'game' | 'meeting';
      location?: string;
    },
    options: ConflictCheckOptions & SchedulingOptions = {}
  ) => {
    // First detect conflicts
    const conflicts = await detectConflicts(proposedEvent, options);
    
    // If conflicts exist, generate suggestions
    if (conflicts?.hasConflicts) {
      await generateSuggestions({
        eventType: proposedEvent.eventType,
        location: proposedEvent.location,
        duration: (proposedEvent.endTime.getTime() - proposedEvent.startTime.getTime()) / (1000 * 60),
        ...options
      });
    }
    
    return { conflicts, suggestions: state.suggestions };
  }, [detectConflicts, generateSuggestions, state.suggestions]);
  
  /**
   * Get comprehensive team insights
   */
  const getTeamInsights = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const [analytics, insights, attendanceInsights] = await Promise.all([
        loadAnalytics('season'),
        loadInsights(),
        AttendanceAnalyticsService.getAttendanceInsights(options.teamId)
      ]);
      
      return { analytics, insights, attendanceInsights };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get insights';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      return null;
    }
  }, [loadAnalytics, loadInsights, options.teamId]);
  
  // ==========================================
  // UI State Management
  // ==========================================
  
  const toggleConflictDetails = useCallback(() => {
    setState(prev => ({ ...prev, showConflictDetails: !prev.showConflictDetails }));
  }, []);
  
  const toggleOptimizationSuggestions = useCallback(() => {
    setState(prev => ({ ...prev, showOptimizationSuggestions: !prev.showOptimizationSuggestions }));
  }, []);
  
  const toggleAnalyticsDashboard = useCallback(() => {
    setState(prev => ({ ...prev, showAnalyticsDashboard: !prev.showAnalyticsDashboard }));
  }, []);
  
  const clearErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
      conflictError: null,
      suggestionError: null,
      analyticsError: null
    }));
  }, []);
  
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      isDetectingConflicts: false,
      isGeneratingSuggestions: false,
      isAnalyzingAttendance: false,
      isOptimizingSchedule: false,
      conflicts: null,
      suggestions: [],
      analytics: null,
      insights: null,
      predictions: [],
      error: null,
      conflictError: null,
      suggestionError: null,
      analyticsError: null,
      showConflictDetails: false,
      showOptimizationSuggestions: false,
      showAnalyticsDashboard: false
    });
  }, []);
  
  // ==========================================
  // Auto-loading Effects
  // ==========================================
  
  useEffect(() => {
    if (options.autoLoadAnalytics) {
      loadAnalytics();
    }
  }, [options.autoLoadAnalytics, loadAnalytics]);
  
  useEffect(() => {
    if (options.autoLoadInsights) {
      loadInsights();
    }
  }, [options.autoLoadInsights, loadInsights]);
  
  // ==========================================
  // Return Hook Interface
  // ==========================================
  
  return {
    // State
    ...state,
    
    // Core Functions
    detectConflicts,
    generateSuggestions,
    loadAnalytics,
    loadInsights,
    predictAttendance,
    processIntelligentRequest,
    
    // Convenience Functions
    checkEventAndSuggest,
    getTeamInsights,
    
    // UI State Management
    toggleConflictDetails,
    toggleOptimizationSuggestions,
    toggleAnalyticsDashboard,
    clearErrors,
    resetState,
    
    // Computed Properties
    hasConflicts: state.conflicts?.hasConflicts || false,
    hasSuggestions: state.suggestions.length > 0,
    hasAnalytics: state.analytics !== null,
    hasInsights: state.insights !== null,
    hasPredictions: state.predictions.length > 0,
    hasErrors: !!(state.error || state.conflictError || state.suggestionError || state.analyticsError),
    isAnyLoading: state.isLoading || state.isDetectingConflicts || state.isGeneratingSuggestions || state.isAnalyzingAttendance || state.isOptimizingSchedule
  };
};

export default useIntelligentCalendar;
