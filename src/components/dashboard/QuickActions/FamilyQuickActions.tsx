import React from 'react';
import { Button } from '../../ui';

/**
 * Family Quick Actions - Family member-specific dashboard shortcuts
 * 
 * Features:
 * - View player progress and stats
 * - Check schedules and events
 * - Communicate with coaches
 * - Access family-specific resources
 */
export const FamilyQuickActions: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        variant="primary" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Player Progress')}
      >
        <span className="mr-2">📈</span>
        My Player&apos;s Progress
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Team Schedule')}
      >
        <span className="mr-2">📅</span>
        Team Schedule
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Message Coach')}
      >
        <span className="mr-2">💬</span>
        Message Coach
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Game Highlights')}
      >
        <span className="mr-2">🎬</span>
        Game Highlights
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('RSVP Events')}
      >
        <span className="mr-2">✅</span>
        RSVP to Events
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Team Photos')}
      >
        <span className="mr-2">📸</span>
        Team Photos
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Parent Network')}
      >
        <span className="mr-2">👥</span>
        Parent Network
      </Button>
    </div>
  );
};
