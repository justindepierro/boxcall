import React from 'react';
import { Button } from '../../ui';

/**
 * Player Quick Actions - Player-specific dashboard shortcuts
 * 
 * Features:
 * - View personal stats and progress
 * - Study plays and formations
 * - Check assignments and schedules
 * - Connect with teammates
 */
export const PlayerQuickActions: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        variant="primary" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('View Stats')}
      >
        <span className="mr-2">📊</span>
        View My Stats
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Study Playbook')}
      >
        <span className="mr-2">📋</span>
        Study Playbook
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Check Assignments')}
      >
        <span className="mr-2">📝</span>
        Check Assignments
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Team Chat')}
      >
        <span className="mr-2">💬</span>
        Team Chat
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Update Gear')}
      >
        <span className="mr-2">👕</span>
        Update My Gear
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Training Log')}
      >
        <span className="mr-2">💪</span>
        Training Log
      </Button>
    </div>
  );
};
