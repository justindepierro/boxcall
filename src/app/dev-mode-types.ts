// Development mode types and utilities
export type DevMode = 
  | 'production'           // Normal production mode
  | 'super_admin_real'     // Super admin with your real team
  | 'super_admin_mock'     // Super admin with mock data
  | 'view_as_head_coach'   // View as head coach
  | 'view_as_coach'        // View as assistant coach
  | 'view_as_player'       // View as player
  | 'view_as_manager'      // View as team manager
  | 'view_as_family';      // View as family member

export type MockTeamData = {
  id: string;
  name: string;
  description: string;
  team_code: string;
  subscription_type: 'free' | 'coach' | 'team_premium';
  players: Array<{
    id: string;
    first_name: string;
    last_name: string;
    jersey_number: number;
    positions: string[];
    grade: number;
    height: string;
    weight: number;
    team_level: 'varsity' | 'jv' | 'middle_school' | 'freshman';
  }>;
  coaches: Array<{
    id: string;
    name: string;
    role: 'head_coach' | 'assistant_coach' | 'coordinator' | 'manager';
  }>;
};

export interface DevModeContextType {
  devMode: DevMode;
  setDevMode: (mode: DevMode) => void;
  mockTeamData: MockTeamData;
  isDevMode: boolean;
  effectiveUserRole: string;
  effectiveTeamData: MockTeamData | null;
}

// Mock team data for development
export const mockTeamData: MockTeamData = {
  id: 'mock-team-eagles',
  name: 'Eastside Eagles',
  description: 'High School Varsity Football - Mock Development Team',
  team_code: 'EAGLES',
  subscription_type: 'team_premium',
  players: [
    {
      id: 'player-1',
      first_name: 'Marcus',
      last_name: 'Thompson',
      jersey_number: 12,
      positions: ['QB'],
      grade: 11,
      height: '6\'2"',
      weight: 185,
      team_level: 'varsity'
    },
    {
      id: 'player-2',
      first_name: 'David',
      last_name: 'Rodriguez',
      jersey_number: 88,
      positions: ['WR', 'KR'],
      grade: 12,
      height: '5\'11"',
      weight: 175,
      team_level: 'varsity'
    },
    {
      id: 'player-3',
      first_name: 'Jake',
      last_name: 'Williams',
      jersey_number: 55,
      positions: ['LB', 'FB'],
      grade: 10,
      height: '6\'0"',
      weight: 195,
      team_level: 'varsity'
    },
    {
      id: 'player-4',
      first_name: 'Tyler',
      last_name: 'Anderson',
      jersey_number: 3,
      positions: ['RB', 'DB'],
      grade: 9,
      height: '5\'10"',
      weight: 165,
      team_level: 'varsity'
    },
    {
      id: 'player-5',
      first_name: 'Brandon',
      last_name: 'Martinez',
      jersey_number: 77,
      positions: ['OL'],
      grade: 12,
      height: '6\'4"',
      weight: 245,
      team_level: 'varsity'
    },
    {
      id: 'player-6',
      first_name: 'Alex',
      last_name: 'Johnson',
      jersey_number: 21,
      positions: ['DB', 'WR'],
      grade: 11,
      height: '5\'9"',
      weight: 170,
      team_level: 'varsity'
    },
    {
      id: 'player-7',
      first_name: 'Ryan',
      last_name: 'Davis',
      jersey_number: 44,
      positions: ['LB'],
      grade: 12,
      height: '6\'1"',
      weight: 200,
      team_level: 'varsity'
    },
    {
      id: 'player-8',
      first_name: 'Ethan',
      last_name: 'Wilson',
      jersey_number: 99,
      positions: ['DL'],
      grade: 11,
      height: '6\'3"',
      weight: 225,
      team_level: 'varsity'
    }
  ],
  coaches: [
    {
      id: 'coach-1',
      name: 'Mike Johnson',
      role: 'head_coach'
    },
    {
      id: 'coach-2',
      name: 'Sarah Williams',
      role: 'assistant_coach'
    },
    {
      id: 'coach-3',
      name: 'David Brown',
      role: 'coordinator'
    },
    {
      id: 'coach-4',
      name: 'Lisa Davis',
      role: 'manager'
    }
  ]
};
