/**
 * Offline-enhanced Dashboard Layout
 * Part of Phase 3B: Offline Architecture
 * 
 * Demonstrates integration of offline data management with existing components
 */
import React, { useState } from 'react';
import { MobileLoadingStrategy } from '../components/ui/MobileLoadingStrategy';
import { OfflineAwareContainer, OfflineStatusBar } from '../components/ui/OfflineStatus';
import { useOfflineData } from '../hooks/useOfflineData';
import { Typography } from '../components/design-system/Typography';

// Example play data structure
interface Play {
  id: string;
  name: string;
  formation: string;
  description: string;
  tags: string[];
}

// Example team data structure
interface Team {
  id: string;
  name: string;
  players: number;
  lastUpdated: string;
}

// Simulate API calls (replace with actual API integration)
const fetchPlays = async (): Promise<Play[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate some API calls failing occasionally
  if (Math.random() < 0.1) {
    throw new Error('Network error: Unable to fetch plays');
  }
  
  return [
    {
      id: '1',
      name: 'Wing Right Power',
      formation: 'I-Formation',
      description: 'Power run to the right side with wing blocking',
      tags: ['run', 'power', 'right']
    },
    {
      id: '2', 
      name: 'Quick Slant',
      formation: 'Spread',
      description: 'Quick 3-step slant pattern',
      tags: ['pass', 'quick', 'slant']
    },
    {
      id: '3',
      name: 'Draw Play',
      formation: 'Shotgun',
      description: 'Delayed handoff from shotgun formation',
      tags: ['run', 'draw', 'misdirection']
    }
  ];
};

const fetchTeamData = async (): Promise<Team[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: 'team-1',
      name: 'Varsity Eagles',
      players: 45,
      lastUpdated: new Date().toISOString()
    }
  ];
};

// Offline-enhanced playbook section
const OfflinePlaybookSection: React.FC = () => {
  const { 
    data: plays, 
    isLoading, 
    error, 
    isOfflineData, 
    dataAge, 
    refresh 
  } = useOfflineData<Play>('play', undefined, fetchPlays);

  return (
    <MobileLoadingStrategy
      isLoading={isLoading}
      error={error}
      onRetry={refresh}
      skeletonType="list"
      showNetworkHints
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Typography variant="headline-md" className="text-gray-900">
            Team Playbook
          </Typography>
          {isOfflineData && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Typography variant="caption">
                Offline data {dataAge ? `(${Math.round(dataAge / 60000)}m old)` : ''}
              </Typography>
            </div>
          )}
        </div>

        <div className="grid gap-3">
          {plays.map((play) => (
            <div
              key={play.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <Typography variant="body-md" className="font-semibold text-gray-900">
                  {play.name}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  {play.formation}
                </Typography>
              </div>
              <Typography variant="body-sm" className="text-gray-600 mb-2">
                {play.description}
              </Typography>
              <div className="flex flex-wrap gap-1">
                {play.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLoadingStrategy>
  );
};

// Offline-enhanced team section
const OfflineTeamSection: React.FC = () => {
  const { 
    data: teams, 
    isLoading, 
    error, 
    isOfflineData, 
    refresh 
  } = useOfflineData<Team>('team', undefined, fetchTeamData);

  return (
    <MobileLoadingStrategy
      isLoading={isLoading}
      error={error}
      onRetry={refresh}
      skeletonType="dashboard"
      showNetworkHints={false}
    >
      <div className="space-y-4">
        <Typography variant="headline-md" className="text-gray-900">
          Team Info
        </Typography>

        {teams.map((team) => (
          <div
            key={team.id}
            className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <Typography variant="body-md" className="font-semibold text-gray-900">
                {team.name}
              </Typography>
              {isOfflineData && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Offline
                </span>
              )}
            </div>
            <Typography variant="body-sm" className="text-gray-600">
              {team.players} players
            </Typography>
            <Typography variant="caption" className="text-gray-500">
              Updated: {new Date(team.lastUpdated).toLocaleDateString()}
            </Typography>
          </div>
        ))}
      </div>
    </MobileLoadingStrategy>
  );
};

// Main offline-enhanced dashboard
export const OfflineEnhancedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'plays' | 'team'>('overview');

  return (
    <OfflineAwareContainer showBanner showStatusBar={false}>
      <div className="min-h-screen bg-gray-50">
        {/* Header with offline status */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="display-md" className="text-team-primary">
              BoxCall
            </Typography>
            <OfflineStatusBar showInHeader />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'plays', label: 'Plays' },
              { id: 'team', label: 'Team' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-team-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <Typography variant="headline-lg" className="text-gray-900 mb-4">
                  Team Overview
                </Typography>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <Typography variant="display-md" className="text-blue-600">
                      12
                    </Typography>
                    <Typography variant="body-sm" className="text-gray-600">
                      Total Plays
                    </Typography>
                  </div>
                  <div className="p-4 bg-white border border-gray-200 rounded-lg">
                    <Typography variant="display-md" className="text-green-600">
                      45
                    </Typography>
                    <Typography variant="body-sm" className="text-gray-600">
                      Team Members
                    </Typography>
                  </div>
                </div>
              </div>
              <OfflineTeamSection />
            </div>
          )}

          {activeTab === 'plays' && <OfflinePlaybookSection />}

          {activeTab === 'team' && <OfflineTeamSection />}
        </div>

        {/* Status Bar at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
          <OfflineStatusBar />
        </div>
      </div>
    </OfflineAwareContainer>
  );
};

export default OfflineEnhancedDashboard;
