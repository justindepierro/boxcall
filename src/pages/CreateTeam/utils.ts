// Utility functions for CreateTeam workflow

export function validateTeamName(name: string): boolean {
  return name.trim().length > 2;
}

// Add more validation/formatting utilities as needed
