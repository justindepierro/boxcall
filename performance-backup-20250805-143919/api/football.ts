// Mock API functions for testing React Query integration
// In production, these would connect to your actual backend

export interface TeamResponse {
  id: string;
  name: string;
  season: string;
  level: "youth" | "middle_school" | "high_school" | "college" | "professional";
  headCoachName: string;
  playerCount: number;
  recordWins: number;
  recordLosses: number;
}

export interface PlayerResponse {
  id: string;
  name: string;
  jersey: number;
  position: string;
  grade?: number;
  height?: string;
  weight?: number;
  stats: {
    gamesPlayed: number;
    touchdowns: number;
    yards: number;
    tackles: number;
  };
}

export interface GameResponse {
  id: string;
  opponent: string;
  date: string;
  homeAway: "home" | "away";
  result?: "win" | "loss" | "tie";
  score?: {
    us: number;
    them: number;
  };
}

// Simulated network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock team data
const mockTeams: TeamResponse[] = [
  {
    id: "team-1",
    name: "Central High Eagles",
    season: "2025",
    level: "high_school",
    headCoachName: "Coach Johnson",
    playerCount: 45,
    recordWins: 8,
    recordLosses: 2,
  },
  {
    id: "team-2",
    name: "Westside Warriors",
    season: "2025",
    level: "high_school",
    headCoachName: "Coach Smith",
    playerCount: 38,
    recordWins: 6,
    recordLosses: 4,
  },
];

// Mock player data
const mockPlayers: PlayerResponse[] = [
  {
    id: "player-1",
    name: "Marcus Thompson",
    jersey: 12,
    position: "QB",
    grade: 11,
    height: "6'2\"",
    weight: 185,
    stats: {
      gamesPlayed: 10,
      touchdowns: 18,
      yards: 2350,
      tackles: 0,
    },
  },
  {
    id: "player-2",
    name: "David Rodriguez",
    jersey: 88,
    position: "WR",
    grade: 12,
    height: "5'11\"",
    weight: 175,
    stats: {
      gamesPlayed: 10,
      touchdowns: 12,
      yards: 1240,
      tackles: 0,
    },
  },
  {
    id: "player-3",
    name: "Jake Williams",
    jersey: 55,
    position: "LB",
    grade: 10,
    height: "6'0\"",
    weight: 195,
    stats: {
      gamesPlayed: 10,
      touchdowns: 0,
      yards: 0,
      tackles: 78,
    },
  },
];

// Mock games data
const mockGames: GameResponse[] = [
  {
    id: "game-1",
    opponent: "North Valley Titans",
    date: "2025-09-15",
    homeAway: "home",
    result: "win",
    score: { us: 28, them: 14 },
  },
  {
    id: "game-2",
    opponent: "East Ridge Panthers",
    date: "2025-09-22",
    homeAway: "away",
    result: "loss",
    score: { us: 17, them: 21 },
  },
  {
    id: "game-3",
    opponent: "South City Bulldogs",
    date: "2025-10-05",
    homeAway: "home",
    result: "win",
    score: { us: 35, them: 7 },
  },
];

// API Functions
export const footballAPI = {
  // Teams
  getTeams: async (): Promise<TeamResponse[]> => {
    await delay(800); // Simulate network delay
    return mockTeams;
  },

  getTeam: async (teamId: string): Promise<TeamResponse> => {
    await delay(500);
    const team = mockTeams.find((t) => t.id === teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }
    return team;
  },

  // Players
  getPlayers: async (teamId: string): Promise<PlayerResponse[]> => {
    await delay(600);
    // In real app, filter by teamId
    console.log("Fetching players for team:", teamId);
    return mockPlayers;
  },

  getPlayer: async (playerId: string): Promise<PlayerResponse> => {
    await delay(400);
    const player = mockPlayers.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found`);
    }
    return player;
  },

  // Games
  getGames: async (teamId: string): Promise<GameResponse[]> => {
    await delay(700);
    // In real app, filter by teamId
    console.log("Fetching games for team:", teamId);
    return mockGames;
  },

  getGame: async (gameId: string): Promise<GameResponse> => {
    await delay(300);
    const game = mockGames.find((g) => g.id === gameId);
    if (!game) {
      throw new Error(`Game with id ${gameId} not found`);
    }
    return game;
  },

  // Mutations (for testing)
  updatePlayerStats: async (
    playerId: string,
    stats: Partial<PlayerResponse["stats"]>
  ): Promise<PlayerResponse> => {
    await delay(1000);
    const player = mockPlayers.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found`);
    }
    player.stats = { ...player.stats, ...stats };
    return player;
  },
};
