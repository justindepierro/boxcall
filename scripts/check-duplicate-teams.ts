#!/usr/bin/env npx tsx

/**
 * Check for duplicate teams in the database
 * 
 * This script helps identify potential duplicate team entries
 * and provides information for cleanup or user assistance.
 */

import { supabase } from "../src/lib/supabase.js";

interface TeamRecord {
  id: string;
  name: string;
  school_name: string;
  school_district?: string;
  school_city?: string;
  school_state?: string;
  created_at: string;
  status?: string;
}

async function checkDuplicateTeams() {
  console.log("🔍 Checking for duplicate teams...");
  
  try {
    // Fetch all teams
    const { data: teams, error } = await supabase
      .from("teams")
      .select("id, name, school_name, school_district, school_city, school_state, created_at, status")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("❌ Error fetching teams:", error);
      return;
    }
    
    if (!teams || teams.length === 0) {
      console.log("ℹ️ No teams found in database");
      return;
    }
    
    console.log(`📊 Found ${teams.length} teams total`);
    
    // Group teams by similarity
    const duplicateGroups: TeamRecord[][] = [];
    const processed = new Set<string>();
    
    for (let i = 0; i < teams.length; i++) {
      const team1 = teams[i];
      
      if (processed.has(team1.id)) continue;
      
      const similarTeams: TeamRecord[] = [team1];
      processed.add(team1.id);
      
      // Find similar teams
      for (let j = i + 1; j < teams.length; j++) {
        const team2 = teams[j];
        
        if (processed.has(team2.id)) continue;
        
        if (areTeamsSimilar(team1, team2)) {
          similarTeams.push(team2);
          processed.add(team2.id);
        }
      }
      
      // If we found similar teams, add to duplicate groups
      if (similarTeams.length > 1) {
        duplicateGroups.push(similarTeams);
      }
    }
    
    // Report results
    if (duplicateGroups.length === 0) {
      console.log("✅ No duplicate teams found!");
    } else {
      console.log(`⚠️ Found ${duplicateGroups.length} potential duplicate groups:`);
      console.log("");
      
      duplicateGroups.forEach((group, index) => {
        console.log(`🔄 Duplicate Group ${index + 1}:`);
        group.forEach((team, teamIndex) => {
          console.log(`  ${teamIndex + 1}. ${team.name} (${team.school_name})`);
          console.log(`     ID: ${team.id}`);
          console.log(`     Created: ${team.created_at}`);
          if (team.school_city && team.school_state) {
            console.log(`     Location: ${team.school_city}, ${team.school_state}`);
          }
          if (team.school_district) {
            console.log(`     District: ${team.school_district}`);
          }
          console.log(`     Status: ${team.status || 'active'}`);
          console.log("");
        });
        console.log("---");
      });
      
      // Suggest actions
      console.log("🛠️ Suggested Actions:");
      console.log("1. Review each duplicate group manually");
      console.log("2. Contact team owners to verify which is correct");
      console.log("3. Merge or deactivate duplicate entries");
      console.log("4. Update team creation process to prevent future duplicates");
    }
    
    // Show recent teams for context
    console.log("");
    console.log("📅 Recent Teams (last 10):");
    teams.slice(0, 10).forEach((team, index) => {
      console.log(`${index + 1}. ${team.name} (${team.school_name}) - ${team.created_at}`);
    });
    
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

function areTeamsSimilar(team1: TeamRecord, team2: TeamRecord): boolean {
  // School name similarity
  const schoolSimilarity = stringSimilarity(team1.school_name, team2.school_name);
  
  // Team name similarity (from full name)
  const teamName1 = extractTeamName(team1.name, team1.school_name);
  const teamName2 = extractTeamName(team2.name, team2.school_name);
  const teamSimilarity = stringSimilarity(teamName1, teamName2);
  
  // Location similarity
  let locationMatch = false;
  if (team1.school_city && team2.school_city && team1.school_state && team2.school_state) {
    const cityMatch = stringSimilarity(team1.school_city, team2.school_city) > 0.8;
    const stateMatch = team1.school_state.toLowerCase() === team2.school_state.toLowerCase();
    locationMatch = cityMatch && stateMatch;
  }
  
  // District similarity
  let districtMatch = false;
  if (team1.school_district && team2.school_district) {
    districtMatch = stringSimilarity(team1.school_district, team2.school_district) > 0.8;
  }
  
  // Consider similar if:
  // 1. Very similar school names (>90%)
  // 2. Similar school names (>70%) + same location
  // 3. Similar school names (>70%) + same district
  // 4. Exact school match + similar team names
  
  if (schoolSimilarity > 0.9) return true;
  if (schoolSimilarity > 0.7 && locationMatch) return true;
  if (schoolSimilarity > 0.7 && districtMatch) return true;
  if (schoolSimilarity > 0.95 && teamSimilarity > 0.7) return true;
  
  return false;
}

function extractTeamName(fullName: string, schoolName: string): string {
  // Remove school name from full team name to get mascot/team name
  const cleaned = fullName.replace(schoolName, "").trim();
  return cleaned || fullName;
}

function stringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
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

// Run the check
checkDuplicateTeams().then(() => {
  console.log("✅ Duplicate check completed");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});