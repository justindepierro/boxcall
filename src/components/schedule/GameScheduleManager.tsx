import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Typography } from '../design-system/Typography';
import { Button } from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import Card from '../ui/Card/Card';
import { Modal } from '../ui/Modal/Modal';

// Game Schedule Types
export interface Game {
  id: string;
  teamId: string;
  date: Date;
  time: string;
  opponent: string;
  location: string;
  homeAway: 'home' | 'away';
  season: string;
  week?: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface CreateGameData {
  date: Date;
  time: string;
  opponent: string;
  location: string;
  homeAway: 'home' | 'away';
  season: string;
  week?: number;
  notes?: string;
}

export function GameScheduleManager() {
  const { teamId } = useParams<{ teamId: string }>();
  const [games, setGames] = useState<Game[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    if (teamId) {
      // Simulate loading games
      const mockGames: Game[] = [
        {
          id: '1',
          teamId,
          date: new Date(2025, 8, 15), // Sept 15, 2025
          time: '7:00 PM',
          opponent: 'Riverside Raiders',
          location: 'Eastside High School',
          homeAway: 'home',
          season: '2025 Fall',
          week: 1,
          notes: 'Season opener - extra preparation needed',
          createdBy: 'coach1',
          createdAt: new Date()
        },
        {
          id: '2',
          teamId,
          date: new Date(2025, 8, 22), // Sept 22, 2025
          time: '7:30 PM',
          opponent: 'Mountain View Mustangs',
          location: 'Mountain View Stadium',
          homeAway: 'away',
          season: '2025 Fall',
          week: 2,
          notes: 'Rival game - expect large crowd',
          createdBy: 'coach1',
          createdAt: new Date()
        },
        {
          id: '3',
          teamId,
          date: new Date(2025, 8, 29), // Sept 29, 2025
          time: '6:00 PM',
          opponent: 'Central City Cougars',
          location: 'Eastside High School',
          homeAway: 'home',
          season: '2025 Fall',
          week: 3,
          notes: 'Homecoming game',
          createdBy: 'coach1',
          createdAt: new Date()
        }
      ];
      setGames(mockGames);
    }
  }, [teamId]);

  const handleCreateGame = async (gameData: CreateGameData) => {
    setLoading(true);
    try {
      // In real implementation, this would call the API
      const newGame: Game = {
        id: Date.now().toString(),
        teamId: teamId!,
        ...gameData,
        createdBy: 'current-user',
        createdAt: new Date()
      };
      
      setGames(prev => [...prev, newGame].sort((a, b) => a.date.getTime() - b.date.getTime()));
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGame = async (gameId: string, updates: Partial<Game>) => {
    setLoading(true);
    try {
      setGames(prev => prev.map(game => 
        game.id === gameId ? { ...game, ...updates } : game
      ));
      setIsEditModalOpen(false);
      setSelectedGame(null);
    } catch (error) {
      console.error('Failed to update game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    
    setLoading(true);
    try {
      setGames(prev => prev.filter(game => game.id !== gameId));
    } catch (error) {
      console.error('Failed to delete game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Typography variant="headline-lg" className="text-navy-900 font-display">
          Game Schedule
        </Typography>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-jade-600 hover:bg-jade-700 text-white"
        >
          + Add Game
        </Button>
      </div>

      {/* Schedule Overview */}
      <Card>
        <div className="p-6">
          <Typography variant="headline-md" className="text-navy-900 mb-4">
            2025 Fall Season
          </Typography>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-jade-50 rounded-lg">
              <Typography variant="headline-sm" className="text-jade-800 font-display">
                {games.length}
              </Typography>
              <Typography variant="body-sm" className="text-jade-600">
                Total Games
              </Typography>
            </div>
            
            <div className="text-center p-4 bg-navy-50 rounded-lg">
              <Typography variant="headline-sm" className="text-navy-800 font-display">
                {games.filter(g => g.homeAway === 'home').length}
              </Typography>
              <Typography variant="body-sm" className="text-navy-600">
                Home Games
              </Typography>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Typography variant="headline-sm" className="text-gray-800 font-display">
                {games.filter(g => g.homeAway === 'away').length}
              </Typography>
              <Typography variant="body-sm" className="text-gray-600">
                Away Games
              </Typography>
            </div>
          </div>
        </div>
      </Card>

      {/* Games List */}
      <div className="space-y-4">
        {games.map((game) => (
          <Card key={game.id}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Week Number */}
                  <div className="text-center">
                    <Typography variant="body-sm" className="text-gray-500 uppercase tracking-wide">
                      Week
                    </Typography>
                    <Typography variant="headline-sm" className="text-navy-900 font-display">
                      {game.week}
                    </Typography>
                  </div>
                  
                  {/* Game Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Typography variant="headline-md" className="text-navy-900">
                        vs {game.opponent}
                      </Typography>
                      
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        game.homeAway === 'home' 
                          ? 'bg-jade-100 text-jade-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {game.homeAway === 'home' ? '🏠 HOME' : '✈️ AWAY'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>{format(game.date, 'MMM d, yyyy')}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span>🕐</span>
                        <span>{game.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span>📍</span>
                        <span>{game.location}</span>
                      </div>
                    </div>
                    
                    {game.notes && (
                      <Typography variant="body-sm" className="text-gray-600 mt-2">
                        📝 {game.notes}
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedGame(game);
                      setIsEditModalOpen(true);
                    }}
                  >
                    ✏️ Edit
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGame(game.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {games.length === 0 && (
          <Card>
            <div className="p-12 text-center">
              <Typography variant="headline-md" className="text-gray-500 mb-4">
                No games scheduled yet
              </Typography>
              <Typography variant="body-lg" className="text-gray-400 mb-6">
                Add your first game to get started with the season schedule
              </Typography>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-jade-600 hover:bg-jade-700 text-white"
              >
                + Add First Game
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Game Modal */}
      <GameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateGame}
        loading={loading}
        title="Add New Game"
      />

      {/* Edit Game Modal */}
      {selectedGame && (
        <GameModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGame(null);
          }}
          onSave={(data) => handleUpdateGame(selectedGame.id, data)}
          loading={loading}
          title="Edit Game"
          initialData={selectedGame}
        />
      )}
    </div>
  );
}

// Game Modal Component
interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateGameData) => Promise<void>;
  loading: boolean;
  title: string;
  initialData?: Game;
}

function GameModal({ isOpen, onClose, onSave, loading, title, initialData }: GameModalProps) {
  const [date, setDate] = useState(initialData?.date ? format(initialData.date, 'yyyy-MM-dd') : '');
  const [time, setTime] = useState(initialData?.time || '');
  const [opponent, setOpponent] = useState(initialData?.opponent || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [homeAway, setHomeAway] = useState<'home' | 'away'>(initialData?.homeAway || 'home');
  const [season, setSeason] = useState(initialData?.season || '2025 Fall');
  const [week, setWeek] = useState(initialData?.week?.toString() || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const gameData: CreateGameData = {
      date: new Date(date),
      time,
      opponent,
      location,
      homeAway,
      season,
      week: week ? parseInt(week) : undefined,
      notes
    };
    
    await onSave(gameData);
    
    // Reset form if creating new
    if (!initialData) {
      setDate('');
      setTime('');
      setOpponent('');
      setLocation('');
      setHomeAway('home');
      setSeason('2025 Fall');
      setWeek('');
      setNotes('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Typography variant="headline-md" className="text-navy-900 mb-6">
          {title}
        </Typography>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <Input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="7:00 PM"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opponent
            </label>
            <Input
              type="text"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="e.g., Riverside Raiders"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Eastside High School"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home/Away
              </label>
              <select
                value={homeAway}
                onChange={(e) => setHomeAway(e.target.value as 'home' | 'away')}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-jade-500 focus:border-jade-500"
              >
                <option value="home">🏠 Home</option>
                <option value="away">✈️ Away</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Week
              </label>
              <Input
                type="number"
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                placeholder="1"
                min="1"
                max="20"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <Input
              type="text"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="e.g., 2025 Fall"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes about this game..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-jade-500 focus:border-jade-500"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-jade-600 hover:bg-jade-700 text-white"
              disabled={loading}
            >
              {loading ? 'Saving...' : (initialData ? 'Update Game' : 'Add Game')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
