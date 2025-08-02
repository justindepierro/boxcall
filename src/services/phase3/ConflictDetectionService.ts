/**
 * Phase 3: Intelligent Features - Conflict Detection Service
 * 
 * Provides intelligent conflict detection across teams, coaches, venues, and schedules.
 * This service forms the foundation of BoxCall's smart scheduling system.
 */

import type { CalendarEvent } from '../../types/calendar';
import { supabase } from '../../lib/supabase';

// Types for conflict detection
export interface ConflictDetectionRequest {
  proposedEvent: Partial<CalendarEvent>; // Uses standard 'start'/'end' properties
  teamId: string;
  userId?: string;
  checkAcademicCalendar?: boolean;
  checkVenueConflicts?: boolean;
  checkFamilySchedules?: boolean;
}

export interface Conflict {
  id: string;
  type: 'team' | 'coach' | 'venue' | 'academic' | 'family' | 'travel';
  severity: 'critical' | 'warning' | 'info';
  conflictingEvent: CalendarEvent;
  description: string;
  suggestions?: string[];
  resolution?: ConflictResolution;
}

export interface ConflictResolution {
  type: 'reschedule' | 'relocate' | 'adjust_time' | 'notify_only';
  suggestedAction: string;
  automatable: boolean;
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  safeTimeSlots?: Date[];
}

export interface TeamScheduleConflict {
  teamId: string;
  teamName: string;
  conflictingEvents: CalendarEvent[];
  conflictType: 'practice' | 'game' | 'meeting';
}

export interface CoachConflict {
  coachId: string;
  coachName: string;
  teams: string[];
  conflictingSchedules: CalendarEvent[];
}

export interface VenueConflict {
  venueId: string;
  venueName: string;
  location: string;
  conflictingEvents: CalendarEvent[];
  capacity?: number;
}

export interface AcademicConflict {
  schoolId: string;
  schoolName: string;
  academicEvents: string[];
  description: string;
}

export interface FamilyConflict {
  familyId: string;
  parentId: string;
  siblingEvents: CalendarEvent[];
  conflictType: 'transportation' | 'attendance' | 'time_overlap';
}

/**
 * Core Conflict Detection Service
 * Provides intelligent conflict identification across multiple dimensions
 */
export class ConflictDetectionService {
  
  // ==========================================
  // Core Conflict Detection Engine
  // ==========================================
  
  /**
   * Primary conflict detection method
   * Analyzes proposed events against all potential conflicts
   */
  static async detectConflicts(request: ConflictDetectionRequest): Promise<ConflictDetectionResult> {
    try {
      const conflicts: Conflict[] = [];
      
      // Run all conflict detection checks
      const [
        teamConflicts,
        coachConflicts,
        venueConflicts,
        academicConflicts,
        familyConflicts,
        travelConflicts
      ] = await Promise.all([
        this.detectTeamConflicts(request),
        this.detectCoachConflicts(request),
        request.checkVenueConflicts ? this.detectVenueConflicts(request) : [],
        request.checkAcademicCalendar ? this.detectAcademicConflicts(request) : [],
        request.checkFamilySchedules ? this.detectFamilyConflicts(request) : [],
        this.detectTravelConflicts(request)
      ]);
      
      conflicts.push(
        ...teamConflicts,
        ...coachConflicts,
        ...venueConflicts,
        ...academicConflicts,
        ...familyConflicts,
        ...travelConflicts
      );
      
      // Calculate overall severity
      const severity = this.calculateOverallSeverity(conflicts);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(conflicts, request);
      
      // Find safe time slots if conflicts exist
      const safeTimeSlots = conflicts.length > 0 
        ? await this.findSafeTimeSlots(request)
        : undefined;
      
      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        severity,
        recommendations,
        safeTimeSlots
      };
      
    } catch (error) {
      console.error('Error detecting conflicts:', error);
      throw new Error('Failed to detect schedule conflicts');
    }
  }
  
  // ==========================================
  // Team Conflict Detection
  // ==========================================
  
  /**
   * Detect conflicts with team schedules
   */
  static async detectTeamConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Validate required fields
      if (!request.proposedEvent.start) {
        throw new Error('Proposed event must have a start time');
      }

      // Get team's existing events
      const { data: teamEvents, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('team_id', request.teamId)
        .gte('start_time', this.getTimeWindow(request.proposedEvent.start, -2))
        .lte('start_time', this.getTimeWindow(request.proposedEvent.start, 2));
      
      if (error) throw error;
      
      if (teamEvents) {
        for (const event of teamEvents) {
          const timeOverlap = this.checkTimeOverlap(
            request.proposedEvent,
            event
          );
          
          if (timeOverlap.hasOverlap) {
            conflicts.push({
              id: `team-conflict-${event.id}`,
              type: 'team',
              severity: timeOverlap.overlapMinutes > 60 ? 'critical' : 'warning',
              conflictingEvent: event,
              description: `Team has ${event.event_type} scheduled during this time`,
              suggestions: [
                `Reschedule to ${this.suggestAlternativeTime(request.proposedEvent)}`,
                'Adjust event duration to avoid overlap',
                'Consider splitting into multiple sessions'
              ],
              resolution: {
                type: 'reschedule',
                suggestedAction: 'Move event to next available time slot',
                automatable: true
              }
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error detecting team conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Coach Conflict Detection
  // ==========================================
  
  /**
   * Detect conflicts with coach schedules across multiple teams
   */
  static async detectCoachConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Validate required fields
      if (!request.proposedEvent.start) {
        throw new Error('Proposed event must have a start time');
      }

      // Get coaches for this team
      const { data: teamCoaches, error: coachError } = await supabase
        .from('team_members')
        .select('user_id, users(*)')
        .eq('team_id', request.teamId)
        .in('role', ['coach', 'head_coach', 'assistant_coach']);
      
      if (coachError) throw coachError;
      
      if (teamCoaches) {
        for (const coach of teamCoaches) {
          // Get all teams this coach is involved with
          const { data: coachTeams, error: teamsError } = await supabase
            .from('team_members')
            .select('team_id, teams(*)')
            .eq('user_id', coach.user_id)
            .in('role', ['coach', 'head_coach', 'assistant_coach']);
          
          if (teamsError) continue;
          
          if (coachTeams) {
            // Check events across all coach's teams
            const teamIds = coachTeams.map(t => t.team_id);
            
            const { data: coachEvents, error: eventsError } = await supabase
              .from('calendar_events')
              .select('*')
              .in('team_id', teamIds)
              .gte('start_time', this.getTimeWindow(request.proposedEvent.start, -1))
              .lte('start_time', this.getTimeWindow(request.proposedEvent.start, 1));
            
            if (eventsError) continue;
            
            if (coachEvents) {
              for (const event of coachEvents) {
                const timeOverlap = this.checkTimeOverlap(
                  request.proposedEvent,
                  event
                );
                
                if (timeOverlap.hasOverlap && event.team_id !== request.teamId) {
                  conflicts.push({
                    id: `coach-conflict-${coach.user_id}-${event.id}`,
                    type: 'coach',
                    severity: 'critical',
                    conflictingEvent: event,
                    description: `Coach has conflicting ${event.event_type} with another team`,
                    suggestions: [
                      'Find alternative time slot',
                      'Assign different coach',
                      'Split coaching responsibilities'
                    ],
                    resolution: {
                      type: 'reschedule',
                      suggestedAction: 'Coordinate with coach to find available time',
                      automatable: false
                    }
                  });
                }
              }
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error detecting coach conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Venue Conflict Detection
  // ==========================================
  
  /**
   * Detect conflicts with venue/facility availability
   */
  static async detectVenueConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Validate required fields
      if (!request.proposedEvent.start) {
        throw new Error('Proposed event must have a start time');
      }
      if (!request.proposedEvent.location) return conflicts;
      
      // Get events at the same venue
      const { data: venueEvents, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('location', request.proposedEvent.location)
        .gte('start_time', this.getTimeWindow(request.proposedEvent.start, -0.5))
        .lte('start_time', this.getTimeWindow(request.proposedEvent.start, 0.5));
      
      if (error) throw error;
      
      if (venueEvents) {
        for (const event of venueEvents) {
          const timeOverlap = this.checkTimeOverlap(
            request.proposedEvent,
            event
          );
          
          if (timeOverlap.hasOverlap) {
            conflicts.push({
              id: `venue-conflict-${event.id}`,
              type: 'venue',
              severity: 'critical',
              conflictingEvent: event,
              description: `Venue "${request.proposedEvent.location}" is already booked`,
              suggestions: [
                'Find alternative venue',
                'Adjust time to avoid overlap',
                'Share venue if possible'
              ],
              resolution: {
                type: 'relocate',
                suggestedAction: 'Book alternative venue',
                automatable: false
              }
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error detecting venue conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Academic Calendar Conflict Detection
  // ==========================================
  
  /**
   * Detect conflicts with school academic calendars
   */
  static async detectAcademicConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Validate required fields
      if (!request.proposedEvent.start) {
        throw new Error('Proposed event must have a start time');
      }

      // This would integrate with school district APIs
      // For now, implementing basic holiday/break detection
      
      const academicEvents = this.getAcademicEvents(request.proposedEvent.start);
      
      for (const academicEvent of academicEvents) {
        const eventDate = new Date(request.proposedEvent.start);
        const academicDate = new Date(academicEvent.date);
        
        if (this.isSameDay(eventDate, academicDate)) {
          conflicts.push({
            id: `academic-conflict-${academicEvent.id}`,
            type: 'academic',
            severity: academicEvent.severity,
            conflictingEvent: {
              id: academicEvent.id,
              title: academicEvent.name,
              start: typeof academicEvent.date === 'string' ? academicEvent.date : academicEvent.date.toISOString(),
              type: 'other'
            } as CalendarEvent,
            description: `Conflicts with ${academicEvent.name}`,
            suggestions: [
              'Reschedule to avoid academic conflict',
              'Confirm if school allows activities during this time'
            ],
            resolution: {
              type: 'reschedule',
              suggestedAction: 'Move to non-academic conflict day',
              automatable: true
            }
          });
        }
      }
      
    } catch (error) {
      console.error('Error detecting academic conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Family Schedule Conflict Detection
  // ==========================================
  
  /**
   * Detect conflicts with family schedules (siblings, parents)
   */
  static async detectFamilyConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Get family members and their schedules
      // This would require family grouping functionality
      
      // For now, implementing basic sibling conflict detection
      const teamMembers = await this.getTeamMembers(request.teamId);
      
      for (const member of teamMembers) {
        // Check if member has siblings on other teams
        const siblingConflicts = await this.checkSiblingConflicts(
          member.user_id,
          request.proposedEvent
        );
        
        conflicts.push(...siblingConflicts);
      }
      
    } catch (error) {
      console.error('Error detecting family conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Travel Time Conflict Detection
  // ==========================================
  
  /**
   * Detect impossible travel scenarios between events
   */
  static async detectTravelConflicts(request: ConflictDetectionRequest): Promise<Conflict[]> {
    const conflicts: Conflict[] = [];
    
    try {
      // Validate required fields
      if (!request.proposedEvent.start) {
        throw new Error('Proposed event must have a start time');
      }

      // Get events before and after proposed event
      const { data: surroundingEvents, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('team_id', request.teamId)
        .gte('start_time', this.getTimeWindow(request.proposedEvent.start, -6))
        .lte('start_time', this.getTimeWindow(request.proposedEvent.start, 6))
        .order('start_time');
      
      if (error) throw error;
      
      if (surroundingEvents && request.proposedEvent.location) {
        for (const event of surroundingEvents) {
          if (event.location && event.location !== request.proposedEvent.location) {
            const travelTime = await this.calculateTravelTime(
              event.location,
              request.proposedEvent.location
            );
            
            const timeBetween = this.getTimeBetweenEvents(event, request.proposedEvent);
            
            if (travelTime.minutes > timeBetween.minutes) {
              conflicts.push({
                id: `travel-conflict-${event.id}`,
                type: 'travel',
                severity: 'warning',
                conflictingEvent: event,
                description: `Insufficient travel time (${travelTime.minutes}min needed, ${timeBetween.minutes}min available)`,
                suggestions: [
                  `Allow ${travelTime.minutes} minutes for travel`,
                  'Adjust start time to accommodate travel',
                  'Consider remote participation if possible'
                ],
                resolution: {
                  type: 'adjust_time',
                  suggestedAction: `Add ${travelTime.minutes - timeBetween.minutes} minutes buffer`,
                  automatable: true
                }
              });
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error detecting travel conflicts:', error);
    }
    
    return conflicts;
  }
  
  // ==========================================
  // Helper Methods
  // ==========================================
  
  /**
   * Check if two events have time overlap
   */
  static checkTimeOverlap(event1: Partial<CalendarEvent>, event2: Record<string, unknown>) {
    const start1 = new Date(event1.start!);
    const end1 = new Date(event1.end || event1.start!);
    
    // Handle database field names (start_time/end_time) vs interface field names (start/end)
    const start2 = new Date((event2.start_time || event2.start) as string);
    const end2 = new Date((event2.end_time || event2.end || event2.start_time || event2.start) as string);
    
    const hasOverlap = start1 < end2 && start2 < end1;
    
    let overlapMinutes = 0;
    if (hasOverlap) {
      const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
      const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
      overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
    }
    
    return { hasOverlap, overlapMinutes };
  }
  
  /**
   * Calculate overall conflict severity
   */
  static calculateOverallSeverity(conflicts: Conflict[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (conflicts.length === 0) return 'none';
    
    const hasCritical = conflicts.some(c => c.severity === 'critical');
    const hasWarning = conflicts.some(c => c.severity === 'warning');
    
    if (hasCritical) return 'critical';
    if (conflicts.length > 3) return 'high';
    if (hasWarning) return 'medium';
    return 'low';
  }
  
  /**
   * Generate intelligent recommendations
   */
  static generateRecommendations(conflicts: Conflict[], request: ConflictDetectionRequest): string[] {
    const recommendations: string[] = [];
    
    if (conflicts.length === 0) {
      recommendations.push('No conflicts detected. This time slot is optimal.');
      return recommendations;
    }
    
    // Analyze conflict patterns and suggest solutions
    const conflictTypes = [...new Set(conflicts.map(c => c.type))];
    
    if (conflictTypes.includes('team')) {
      recommendations.push('Consider rescheduling to avoid team conflicts');
    }
    
    if (conflictTypes.includes('coach')) {
      recommendations.push('Coordinate with coaches across multiple teams');
    }
    
    if (conflictTypes.includes('venue')) {
      recommendations.push('Book alternative venue or adjust timing');
    }
    
    if (conflictTypes.includes('travel')) {
      recommendations.push('Add buffer time for travel between locations');
    }
    
    // Add time-based recommendations
    recommendations.push(
      `Suggested alternative: ${this.suggestAlternativeTime(request.proposedEvent)}`
    );
    
    return recommendations;
  }
  
  /**
   * Find safe time slots with no conflicts
   */
  static async findSafeTimeSlots(request: ConflictDetectionRequest): Promise<Date[]> {
    const safeSlots: Date[] = [];
    
    // Validate required fields
    if (!request.proposedEvent.start) {
      throw new Error('Proposed event must have a start time');
    }
    
    const baseDate = new Date(request.proposedEvent.start);
    const duration = this.getEventDuration(request.proposedEvent);
    
    // Check next 7 days for safe slots
    for (let day = 0; day < 7; day++) {
      for (let hour = 9; hour < 21; hour++) { // 9 AM to 9 PM
        const testDate = new Date(baseDate);
        testDate.setDate(testDate.getDate() + day);
        testDate.setHours(hour, 0, 0, 0);
        
        const testEvent = {
          ...request.proposedEvent,
          start: testDate.toISOString(),
          end: new Date(testDate.getTime() + duration * 60 * 1000).toISOString()
        };
        
        const testRequest = { ...request, proposedEvent: testEvent };
        const result = await this.detectConflicts(testRequest);
        
        if (!result.hasConflicts) {
          safeSlots.push(testDate);
          if (safeSlots.length >= 5) break; // Limit to 5 suggestions
        }
      }
      if (safeSlots.length >= 5) break;
    }
    
    return safeSlots;
  }
  
  // Additional helper methods...
  static getTimeWindow(baseTime: Date | string, hourOffset: number): string {
    const date = new Date(baseTime);
    date.setHours(date.getHours() + hourOffset);
    return date.toISOString();
  }
  
  static suggestAlternativeTime(event: Partial<CalendarEvent>): string {
    const date = new Date(event.start!);
    date.setHours(date.getHours() + 2);
    return date.toLocaleString();
  }
  
  static getEventDuration(event: Partial<CalendarEvent>): number {
    if (!event.start || !event.end) return 60; // Default 1 hour
    const start = new Date(event.start);
    const end = new Date(event.end);
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  }
  
  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }
  
  static getAcademicEvents(date: Date | string) {
    // Mock academic events - would integrate with school district APIs
    return [
      {
        id: 'holiday-1',
        name: 'School Holiday',
        date: date,
        severity: 'warning' as const
      }
    ];
  }
  
  static async getTeamMembers(teamId: string) {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);
    return data || [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async checkSiblingConflicts(_userId: string, _proposedEvent: Partial<CalendarEvent>): Promise<Conflict[]> {
    // Mock implementation - would check family relationships
    return [];
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async calculateTravelTime(_origin: string, _destination: string) {
    // Mock implementation - would use Google Maps API
    return { minutes: 30 };
  }
  
  static getTimeBetweenEvents(event1: Record<string, unknown>, event2: Partial<CalendarEvent>) {
    const end1 = new Date((event1.end_time || event1.end) as string);
    const start2 = new Date(event2.start!);
    const minutes = (start2.getTime() - end1.getTime()) / (1000 * 60);
    return { minutes };
  }
}

export default ConflictDetectionService;
