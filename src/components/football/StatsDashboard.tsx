import React from "react";
// Football Statistics Interface
interface PlayerStats {
  playerId: string;
  playerName: string;
  position: string;
  jerseyNumber: number;
  gamesPlayed: number;
  // Offensive Stats
  passingYards?: number;
  passingTDs?: number;
  rushingYards?: number;
  rushingTDs?: number;
  receivingYards?: number;
  receivingTDs?: number;
  receptions?: number;
  // Defensive Stats
  tackles?: number;
  sacks?: number;
  interceptions?: number;
  forcedFumbles?: number;
}
interface TeamStats {
  totalPlayers: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  totalYards: number;
  turnovers: number;
}
// Mock data for demonstration
const mockTeamStats: TeamStats = {
  totalPlayers: 45,
  gamesPlayed: 12,
  wins: 9,
  losses: 3,
  pointsFor: 384,
  pointsAgainst: 217,
  totalYards: 4250,
  turnovers: 18,
};
const mockPlayerStats: PlayerStats[] = [
  {
    playerId: "1",
    playerName: "Marcus Johnson",
    position: "QB",
    jerseyNumber: 12,
    gamesPlayed: 12,
    passingYards: 2840,
    passingTDs: 28,
    rushingYards: 245,
    rushingTDs: 4,
  },
  {
    playerId: "2",
    playerName: "Darius Williams",
    position: "RB",
    jerseyNumber: 23,
    gamesPlayed: 11,
    rushingYards: 1420,
    rushingTDs: 18,
    receivingYards: 285,
    receivingTDs: 3,
    receptions: 24,
  },
  {
    playerId: "3",
    playerName: "Antonio Davis",
    position: "WR",
    jerseyNumber: 81,
    gamesPlayed: 12,
    receivingYards: 945,
    receivingTDs: 12,
    receptions: 62,
  },
  {
    playerId: "4",
    playerName: "James Rodriguez",
    position: "LB",
    jerseyNumber: 55,
    gamesPlayed: 12,
    tackles: 97,
    sacks: 8.5,
    interceptions: 2,
    forcedFumbles: 3,
  },
];
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  highlight?: boolean;
}> = ({ title, value, subtitle, highlight = false }) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-md p-4 border-2 ${
      highlight ? "border-jade-500" : "border-gray-200 dark:border-gray-700"
    }`}
  >
    <div className="text-sm font-sans font-medium text-gray-600 dark:text-gray-400 mb-1">
      {title}
    </div>
    <div
      className={`text-2xl font-mono font-bold ${
        highlight ? "text-jade-600" : "text-gray-900 dark:text-white"
      }`}
    >
      {value}
    </div>
    {subtitle && (
      <div className="text-xs font-sans text-gray-500 dark:text-gray-500 mt-1">
        {subtitle}
      </div>
    )}
  </div>
);
const PlayerStatsRow: React.FC<{ player: PlayerStats }> = ({ player }) => {
  const getPositionColor = (position: string) => {
    if (["QB"].includes(position)) return "text-red-600 bg-red-50";
    if (["RB", "FB", "HB"].includes(position))
      return "text-green-600 bg-green-50";
    if (["WR", "TE"].includes(position)) return "text-blue-600 bg-blue-50";
    if (["LB", "MLB", "OLB", "ILB"].includes(position))
      return "text-purple-600 bg-purple-50";
    if (["CB", "S", "FS", "SS", "DB"].includes(position))
      return "text-yellow-600 bg-yellow-50";
    if (["DE", "DT", "NT", "DL"].includes(position))
      return "text-gray-600 bg-gray-50";
    if (["LT", "LG", "C", "RG", "RT", "OL"].includes(position))
      return "text-navy-600 bg-navy-50";
    return "text-gray-600 bg-gray-50";
  };
  return (
    <tr className="hover:bg-jade-50 dark:hover:bg-navy-900/20 transition-colors">
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-jade-500 rounded-sm flex items-center justify-center text-white font-mono font-bold text-sm">
            {player.jerseyNumber}
          </div>
          <div>
            <div className="font-sans font-semibold text-gray-900 dark:text-white">
              {player.playerName}
            </div>
            <div
              className={`inline-flex px-2 py-1 rounded-sm text-xs font-mono font-bold ${getPositionColor(player.position)}`}
            >
              {player.position}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center font-mono">
        {player.gamesPlayed}
      </td>
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center font-mono">
        {player.passingYards || "-"}
      </td>
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center font-mono">
        {player.rushingYards || "-"}
      </td>
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center font-mono">
        {player.receivingYards || "-"}
      </td>
      <td className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 text-center font-mono">
        {player.tackles || "-"}
      </td>
    </tr>
  );
};
export const StatsDashboard: React.FC = () => {
  const winPercentage = (
    (mockTeamStats.wins / mockTeamStats.gamesPlayed) *
    100
  ).toFixed(1);
  const avgPointsFor = (
    mockTeamStats.pointsFor / mockTeamStats.gamesPlayed
  ).toFixed(1);
  const avgPointsAgainst = (
    mockTeamStats.pointsAgainst / mockTeamStats.gamesPlayed
  ).toFixed(1);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-jade-500 to-jade-600 rounded-md p-6 text-white">
        <h1 className="text-3xl font-display font-bold mb-2">
          🏈 Team Statistics Dashboard
        </h1>
        <p className="font-sans text-jade-100">
          Season performance metrics and player statistics
        </p>
      </div>
      {/* Team Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="WIN PERCENTAGE"
          value={`${winPercentage}%`}
          subtitle={`${mockTeamStats.wins}-${mockTeamStats.losses}`}
          highlight={parseFloat(winPercentage) > 70}
        />
        <StatCard
          title="POINTS PER GAME"
          value={avgPointsFor}
          subtitle="Offense"
        />
        <StatCard
          title="POINTS ALLOWED"
          value={avgPointsAgainst}
          subtitle="Defense"
        />
        <StatCard
          title="TOTAL YARDS"
          value={mockTeamStats.totalYards.toLocaleString()}
          subtitle="Season Total"
        />
      </div>
      {/* Player Statistics Table */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white">
            📊 Player Statistics
          </h2>
          <p className="text-sm font-sans text-gray-600 dark:text-gray-400 mt-1">
            Key performance metrics by player
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-center text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  GP
                </th>
                <th className="px-4 py-3 text-center text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pass YDS
                </th>
                <th className="px-4 py-3 text-center text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rush YDS
                </th>
                <th className="px-4 py-3 text-center text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rec YDS
                </th>
                <th className="px-4 py-3 text-center text-xs font-display font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tackles
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {mockPlayerStats.map((player) => (
                <PlayerStatsRow key={player.playerId} player={player} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-jade-500 hover:bg-jade-600 text-white font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          📈 Export Stats Report
        </button>
        <button className="bg-navy-500 hover:bg-navy-600 text-white font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          📋 Generate Game Plan
        </button>
        <button className="border-2 border-jade-500 text-jade-600 hover:bg-jade-50 dark:hover:bg-jade-900/20 font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          ⚙️ Stat Settings
        </button>
      </div>
    </div>
  );
};
export default StatsDashboard;
