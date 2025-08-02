import React from 'react';
import { Button } from '../../ui';

/**
 * Coach Quick Actions - Coach-specific dashboard shortcuts
 * 
 * Features:
 * - Quick access to playbook editor
 * - Practice script creation
 * - Team management tools
 * - Analytics and performance tracking
 */
export const CoachQuickActions: React.FC = () => {
  return (
    <div className="space-y-3">
      <Button 
        variant="primary" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Create Play')}
      >
        <span className="mr-2">🎯</span>
        Create New Play
      </Button>
      
      <Button 
        variant="primary" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Practice Script')}
      >
        <span className="mr-2">📝</span>
        Build Practice Script
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Playbook Editor')}
      >
        <span className="mr-2">📋</span>
        Playbook Editor
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Team Analytics')}
      >
        <span className="mr-2">📊</span>
        Team Analytics
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Send Announcement')}
      >
        <span className="mr-2">📢</span>
        Send Announcement
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Award Stickers')}
      >
        <span className="mr-2">⭐</span>
        Award Helmet Stickers
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Game Film')}
      >
        <span className="mr-2">🎬</span>
        Upload Game Film
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full justify-start"
        onClick={() => console.log('Player Progress')}
      >
        <span className="mr-2">📈</span>
        Player Progress
      </Button>
    </div>
  );
};
