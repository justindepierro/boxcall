import React, { useState } from 'react';

// Football Formation Types
interface PlayerPosition {
  id: string;
  position: string;
  jerseyNumber: number;
  playerName: string;
  x: number; // 0-100 (percentage of field width)
  y: number; // 0-100 (percentage of field height)
}

interface Formation {
  id: string;
  name: string;
  description: string;
  category: 'offense' | 'defense' | 'special';
  positions: PlayerPosition[];
}

// Mock Formation Data
const mockFormations: Formation[] = [
  {
    id: 'spread-offense',
    name: 'Spread Offense',
    description: '4-wide receiver spread formation with shotgun QB',
    category: 'offense',
    positions: [
      { id: 'qb', position: 'QB', jerseyNumber: 12, playerName: 'Marcus Johnson', x: 20, y: 50 },
      { id: 'rb', position: 'RB', jerseyNumber: 23, playerName: 'Darius Williams', x: 35, y: 50 },
      { id: 'wr1', position: 'WR', jerseyNumber: 81, playerName: 'Antonio Davis', x: 70, y: 20 },
      { id: 'wr2', position: 'WR', jerseyNumber: 11, playerName: 'Mike Thompson', x: 70, y: 40 },
      { id: 'wr3', position: 'WR', jerseyNumber: 3, playerName: 'Chris Brown', x: 70, y: 60 },
      { id: 'wr4', position: 'WR', jerseyNumber: 88, playerName: 'David Wilson', x: 70, y: 80 },
      { id: 'lt', position: 'LT', jerseyNumber: 75, playerName: 'Jake Miller', x: 45, y: 35 },
      { id: 'lg', position: 'LG', jerseyNumber: 66, playerName: 'Tom Garcia', x: 45, y: 42 },
      { id: 'c', position: 'C', jerseyNumber: 52, playerName: 'Alex Martinez', x: 45, y: 50 },
      { id: 'rg', position: 'RG', jerseyNumber: 77, playerName: 'Ryan Lee', x: 45, y: 58 },
      { id: 'rt', position: 'RT', jerseyNumber: 69, playerName: 'Steve Anderson', x: 45, y: 65 },
    ]
  },
  {
    id: '4-3-defense',
    name: '4-3 Defense',
    description: 'Base 4-3 defensive formation with 4 down linemen',
    category: 'defense',
    positions: [
      { id: 'de1', position: 'DE', jerseyNumber: 95, playerName: 'Marcus Johnson', x: 55, y: 25 },
      { id: 'dt1', position: 'DT', jerseyNumber: 91, playerName: 'Kevin Davis', x: 55, y: 40 },
      { id: 'dt2', position: 'DT', jerseyNumber: 93, playerName: 'Tony Rodriguez', x: 55, y: 60 },
      { id: 'de2', position: 'DE', jerseyNumber: 94, playerName: 'James Wilson', x: 55, y: 75 },
      { id: 'mlb', position: 'MLB', jerseyNumber: 55, playerName: 'Carlos Martinez', x: 40, y: 50 },
      { id: 'olb1', position: 'OLB', jerseyNumber: 51, playerName: 'Andre Thomas', x: 40, y: 30 },
      { id: 'olb2', position: 'OLB', jerseyNumber: 53, playerName: 'DeShawn Brown', x: 40, y: 70 },
      { id: 'cb1', position: 'CB', jerseyNumber: 21, playerName: 'Jamal Jones', x: 25, y: 15 },
      { id: 'cb2', position: 'CB', jerseyNumber: 24, playerName: 'Terrell Green', x: 25, y: 85 },
      { id: 'fs', position: 'FS', jerseyNumber: 20, playerName: 'Michael White', x: 15, y: 50 },
      { id: 'ss', position: 'SS', jerseyNumber: 26, playerName: 'Isaiah Johnson', x: 20, y: 35 },
    ]
  }
];

const PlayerDot: React.FC<{
  player: PlayerPosition;
  isSelected: boolean;
  onClick: () => void;
}> = ({ player, isSelected, onClick }) => {
  const getPositionColor = (position: string) => {
    if (['QB'].includes(position)) return 'bg-red-500 border-red-600';
    if (['RB', 'FB', 'HB'].includes(position)) return 'bg-green-500 border-green-600';
    if (['WR', 'TE'].includes(position)) return 'bg-blue-500 border-blue-600';
    if (['LB', 'MLB', 'OLB', 'ILB'].includes(position)) return 'bg-purple-500 border-purple-600';
    if (['CB', 'S', 'FS', 'SS', 'DB'].includes(position)) return 'bg-yellow-500 border-yellow-600';
    if (['DE', 'DT', 'NT', 'DL'].includes(position)) return 'bg-gray-600 border-gray-700';
    if (['LT', 'LG', 'C', 'RG', 'RT', 'OL'].includes(position)) return 'bg-navy-500 border-navy-600';
    return 'bg-jade-500 border-jade-600';
  };

  return (
    <div
      className="absolute cursor-pointer transition-transform hover:scale-110"
      style={{ left: `${player.x}%`, top: `${player.y}%`, transform: 'translate(-50%, -50%)' }}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 rounded-sm border-2 flex items-center justify-center text-white font-mono font-bold text-xs ${
          getPositionColor(player.position)
        } ${isSelected ? 'ring-4 ring-jade-300' : ''}`}
      >
        {player.jerseyNumber}
      </div>
      <div className="text-xs font-sans font-medium text-center mt-1 bg-white dark:bg-gray-800 px-1 rounded-sm border">
        {player.position}
      </div>
    </div>
  );
};

const FormationField: React.FC<{ formation: Formation }> = ({ formation }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  return (
    <div className="bg-green-100 dark:bg-green-900/20 rounded-md p-4 relative border-2 border-green-300 dark:border-green-700">
      {/* Field Markings */}
      <div className="absolute inset-4 border border-white dark:border-green-600 rounded-sm">
        {/* Yard Lines */}
        {[20, 40, 60, 80].map((yard) => (
          <div
            key={yard}
            className="absolute h-full border-l border-white/50 dark:border-green-600/50"
            style={{ left: `${yard}%` }}
          />
        ))}
        
        {/* 50 Yard Line */}
        <div className="absolute h-full border-l-2 border-white dark:border-green-600" style={{ left: '50%' }} />
        
        {/* Hash Marks */}
        <div className="absolute w-full border-t border-white/30 dark:border-green-600/30" style={{ top: '25%' }} />
        <div className="absolute w-full border-t border-white/30 dark:border-green-600/30" style={{ top: '75%' }} />
      </div>

      {/* Player Positions */}
      <div className="relative h-64">
        {formation.positions.map((player) => (
          <PlayerDot
            key={player.id}
            player={player}
            isSelected={selectedPlayer === player.id}
            onClick={() => setSelectedPlayer(selectedPlayer === player.id ? null : player.id)}
          />
        ))}
      </div>

      {/* Selected Player Info */}
      {selectedPlayer && (
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          {(() => {
            const player = formation.positions.find(p => p.id === selectedPlayer);
            if (!player) return null;
            return (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-jade-500 rounded-sm flex items-center justify-center text-white font-mono font-bold">
                  {player.jerseyNumber}
                </div>
                <div>
                  <div className="font-sans font-semibold text-gray-900 dark:text-white">
                    {player.playerName}
                  </div>
                  <div className="text-sm font-mono text-jade-600 dark:text-jade-400">
                    {player.position}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export const FormationDiagram: React.FC = () => {
  const [activeFormation, setActiveFormation] = useState<Formation>(mockFormations[0]);
  const [activeCategory, setActiveCategory] = useState<'offense' | 'defense' | 'special'>('offense');

  const filteredFormations = mockFormations.filter(f => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-500 to-navy-600 rounded-md p-6 text-white">
        <h1 className="text-3xl font-display font-bold mb-2">
          📋 Formation Playbook
        </h1>
        <p className="font-sans text-navy-100">
          Interactive formation diagrams and player positioning
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {(['offense', 'defense', 'special'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`py-4 px-1 border-b-2 font-sans font-medium text-sm capitalize ${
                  activeCategory === category
                    ? "border-jade-500 text-jade-600 dark:text-jade-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {category === 'offense' && '⚡'} 
                {category === 'defense' && '🛡️'} 
                {category === 'special' && '🎯'} 
                {category}
              </button>
            ))}
          </nav>
        </div>

        {/* Formation Selector */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {filteredFormations.map((formation) => (
              <button
                key={formation.id}
                onClick={() => setActiveFormation(formation)}
                className={`text-left p-4 rounded-md border-2 transition-all ${
                  activeFormation.id === formation.id
                    ? 'border-jade-500 bg-jade-50 dark:bg-jade-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-display font-semibold text-gray-900 dark:text-white mb-1">
                  {formation.name}
                </div>
                <div className="text-sm font-sans text-gray-600 dark:text-gray-400">
                  {formation.description}
                </div>
                <div className="text-xs font-mono text-jade-600 dark:text-jade-400 mt-2">
                  {formation.positions.length} PLAYERS
                </div>
              </button>
            ))}
          </div>

          {/* Formation Display */}
          <FormationField formation={activeFormation} />

          {/* Formation Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-3">
                Formation Details
              </h3>
              <div className="space-y-2 text-sm font-sans">
                <div><strong>Name:</strong> {activeFormation.name}</div>
                <div><strong>Category:</strong> <span className="capitalize">{activeFormation.category}</span></div>
                <div><strong>Players:</strong> {activeFormation.positions.length}</div>
                <div><strong>Description:</strong> {activeFormation.description}</div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
              <h3 className="font-display font-semibold text-gray-900 dark:text-white mb-3">
                Position Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Array.from(new Set(activeFormation.positions.map(p => p.position))).map(position => (
                  <div key={position} className="flex justify-between">
                    <span>{position}:</span>
                    <span className="font-bold">
                      {activeFormation.positions.filter(p => p.position === position).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-jade-500 hover:bg-jade-600 text-white font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          📁 Save Formation
        </button>
        <button className="bg-navy-500 hover:bg-navy-600 text-white font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          ✏️ Edit Formation
        </button>
        <button className="border-2 border-jade-500 text-jade-600 hover:bg-jade-50 dark:hover:bg-jade-900/20 font-sans font-semibold py-3 px-4 rounded-sm transition-colors">
          📋 Create New
        </button>
      </div>
    </div>
  );
};

export default FormationDiagram;
