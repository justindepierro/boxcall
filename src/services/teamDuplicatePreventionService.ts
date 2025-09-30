import { supabase } from "../lib/supabase";
import { emitTelemetry } from "../lib/telemetry";

export interface TeamSimilarity {
  teamId: string;
  teamName: string;
  schoolName: string;
  schoolDistrict?: string;
  schoolCity?: string;
  schoolState?: string;
  similarityScore: number;
  matchReasons: string[];
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarTeams: TeamSimilarity[];
  requiresApproval: boolean;
  warningMessage?: string;
}

/**
 * Team Duplicate Prevention Service
 * 
 * Prevents duplicate team creation by detecting similar teams based on:
 * - Exact name matches
 * - Similar school names (fuzzy matching)
 * - Same location (district, city, state)
 * - Combined factors for similarity scoring
 */
export class TeamDuplicatePreventionService {
  
  /**
   * Check for duplicate or similar teams before creation
   */
  static async checkForDuplicates(
    teamName: string,
    schoolName: string,
    schoolDistrict?: string,
    schoolCity?: string,
    schoolState?: string
  ): Promise<DuplicateCheckResult> {
    
    try {
      console.log("🔍 Starting duplicate team check...");
      
      // Fetch all existing teams for comparison
      const { data: existingTeams, error } = await supabase
        .from("teams")
        .select("id, name, school_name, school_district, school_city, school_state")
        .eq("status", "active"); // Only check active teams
      
      if (error) {
        console.warn("Could not fetch teams for duplicate check:", error);
        // If we can't check, allow creation but log the issue
        return {
          isDuplicate: false,
          similarTeams: [],
          requiresApproval: false
        };
      }
      
      const teams = existingTeams || [];
      const similarTeams: TeamSimilarity[] = [];
      
      // Check each existing team for similarity
      for (const team of teams) {
        const similarity = this.calculateSimilarity(
          { teamName, schoolName, schoolDistrict, schoolCity, schoolState },
          {
            teamName: team.name,
            schoolName: team.school_name,
            schoolDistrict: team.school_district,
            schoolCity: team.school_city,
            schoolState: team.school_state
          }
        );
        
        if (similarity.score > 0.3) { // 30% similarity threshold
          similarTeams.push({
            teamId: team.id,
            teamName: team.name,
            schoolName: team.school_name,
            schoolDistrict: team.school_district,
            schoolCity: team.school_city,
            schoolState: team.school_state,
            similarityScore: similarity.score,
            matchReasons: similarity.reasons
          });
        }
      }
      
      // Sort by similarity score (highest first)
      similarTeams.sort((a, b) => b.similarityScore - a.similarityScore);
      
      // Determine if this is a duplicate or requires approval
      const highestSimilarity = similarTeams[0]?.similarityScore || 0;
      const isDuplicate = highestSimilarity > 0.85; // 85% = likely duplicate
      const requiresApproval = highestSimilarity > 0.60; // 60% = needs review
      
      let warningMessage: string | undefined;
      
      if (isDuplicate) {
        const similar = similarTeams[0];
        warningMessage = `A very similar team already exists: "${similar.schoolName} ${similar.teamName}". This might be a duplicate. Please contact customer support if you believe this is incorrect.`;
      } else if (requiresApproval) {
        const similar = similarTeams[0];
        warningMessage = `Similar team found: "${similar.schoolName} ${similar.teamName}". Please verify this is not a duplicate before proceeding. If you're the new coach for this team, contact customer support for account transfer.`;
      }
      
      // Log telemetry for duplicate prevention analytics
      emitTelemetry("team.duplicate_check", {
        potential_duplicates: similarTeams.length,
        highest_similarity: highestSimilarity,
        requires_approval: requiresApproval,
        is_duplicate: isDuplicate
      });
      
      console.log(`🔍 Duplicate check completed: ${similarTeams.length} similar teams found`);
      
      return {
        isDuplicate,
        similarTeams,
        requiresApproval,
        warningMessage
      };
      
    } catch (error) {
      console.error("Error in duplicate check:", error);
      
      // If duplicate check fails, allow creation but log the issue
      emitTelemetry("team.duplicate_check.error", {
        error_message: error instanceof Error ? error.message : String(error)
      });
      
      return {
        isDuplicate: false,
        similarTeams: [],
        requiresApproval: false
      };
    }
  }
  
  /**
   * Calculate similarity between two teams
   */
  private static calculateSimilarity(
    team1: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    },
    team2: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    }
  ): { score: number; reasons: string[] } {
    
    const reasons: string[] = [];
    let totalScore = 0;
    let factors = 0;
    
    // 1. Team name similarity (40% weight)
    const teamNameSimilarity = this.stringSimilarity(team1.teamName, team2.teamName);
    if (teamNameSimilarity > 0.8) {
      reasons.push(`Very similar team names: "${team1.teamName}" vs "${team2.teamName}"`);
      totalScore += teamNameSimilarity * 0.4;
    } else if (teamNameSimilarity > 0.5) {
      reasons.push(`Similar team names: "${team1.teamName}" vs "${team2.teamName}"`);
      totalScore += teamNameSimilarity * 0.4;
    }
    factors += 0.4;
    
    // 2. School name similarity (35% weight)
    const schoolNameSimilarity = this.stringSimilarity(team1.schoolName, team2.schoolName);
    if (schoolNameSimilarity > 0.8) {
      reasons.push(`Very similar school names: "${team1.schoolName}" vs "${team2.schoolName}"`);
      totalScore += schoolNameSimilarity * 0.35;
    } else if (schoolNameSimilarity > 0.5) {
      reasons.push(`Similar school names: "${team1.schoolName}" vs "${team2.schoolName}"`);
      totalScore += schoolNameSimilarity * 0.35;
    }
    factors += 0.35;
    
    // 3. Location similarity (25% weight)
    let locationScore = 0;
    let locationFactors = 0;
    
    // State match (most important for location)
    if (team1.schoolState && team2.schoolState) {
      if (team1.schoolState.toLowerCase() === team2.schoolState.toLowerCase()) {
        locationScore += 0.4;
        reasons.push(`Same state: ${team1.schoolState}`);
      }
      locationFactors += 0.4;
    }
    
    // City match
    if (team1.schoolCity && team2.schoolCity) {
      const citySim = this.stringSimilarity(team1.schoolCity, team2.schoolCity);
      if (citySim > 0.8) {
        locationScore += 0.35;
        reasons.push(`Same/similar city: "${team1.schoolCity}" vs "${team2.schoolCity}"`);
      }
      locationFactors += 0.35;
    }
    
    // District match
    if (team1.schoolDistrict && team2.schoolDistrict) {
      const districtSim = this.stringSimilarity(team1.schoolDistrict, team2.schoolDistrict);
      if (districtSim > 0.8) {
        locationScore += 0.25;
        reasons.push(`Same/similar district: "${team1.schoolDistrict}" vs "${team2.schoolDistrict}"`);
      }
      locationFactors += 0.25;
    }
    
    if (locationFactors > 0) {
      totalScore += (locationScore / locationFactors) * 0.25;
    }
    factors += 0.25;
    
    const finalScore = factors > 0 ? totalScore / factors : 0;
    
    return {
      score: Math.min(1, Math.max(0, finalScore)), // Clamp between 0 and 1
      reasons
    };
  }
  
  /**
   * Calculate string similarity using Levenshtein distance
   */
  private static stringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) return 1;
    
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    
    if (longer.length === 0) return 1;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Send duplicate team report to customer support
   */
  static async reportDuplicateAttempt(
    attemptedTeam: {
      teamName: string;
      schoolName: string;
      schoolDistrict?: string;
      schoolCity?: string;
      schoolState?: string;
    },
    similarTeams: TeamSimilarity[],
    userEmail?: string
  ): Promise<void> {
    
    try {
      console.log("📧 Sending duplicate team report to support...");
      
      // In a real app, this would send to customer support system
      // For now, we'll log it and store in a support_tickets table
      
      const reportData = {
        type: "duplicate_team_attempt",
        user_email: userEmail,
        attempted_team: attemptedTeam,
        similar_teams: similarTeams,
        created_at: new Date().toISOString(),
        status: "pending_review"
      };
      
      // Store in database for support team review
      const { error } = await supabase
        .from("support_tickets")
        .insert(reportData);
      
      if (error) {
        console.warn("Could not store support ticket:", error);
      }
      
      // Emit telemetry
      emitTelemetry("team.duplicate_report_sent", {
        similar_teams_count: similarTeams.length,
        has_user_email: !!userEmail
      });
      
      console.log("📧 Duplicate team report sent successfully");
      
    } catch (error) {
      console.error("Error sending duplicate report:", error);
    }
  }
}