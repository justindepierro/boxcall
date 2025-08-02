import React from 'react';
import { Typography } from '../design-system';
import { Card } from '../ui';

interface PersonalCalendarProps {
  userId: string;
}

/**
 * Personal Calendar - Cross-team events and schedule
 * 
 * Features:
 * - Events from all teams user belongs to
 * - Upcoming games, practices, meetings
 * - Personal reminders and deadlines
 * - Quick RSVP and calendar integration
 */
export const PersonalCalendar: React.FC<PersonalCalendarProps> = () => {
  // TODO: Use props for fetching user-specific calendar events
  
  // Mock calendar data - TODO: Fetch from database
  const mockEvents = [
    {
      id: "1",
      title: "Game vs. Central Lions",
      team: "Eastside Eagles",
      teamLogo: "🦅",
      date: "2024-08-16",
      time: "7:00 PM",
      type: "game",
      location: "Memorial Stadium",
      rsvpRequired: false
    },
    {
      id: "2",
      title: "Practice",
      team: "Eastside Eagles", 
      teamLogo: "🦅",
      date: "2024-08-13",
      time: "3:30 PM",
      type: "practice",
      location: "School Field",
      rsvpRequired: false
    },
    {
      id: "3",
      title: "7v7 Tournament",
      team: "Elite 7v7",
      teamLogo: "⚡",
      date: "2024-08-17",
      time: "9:00 AM",
      type: "tournament",
      location: "Sports Complex",
      rsvpRequired: true
    },
    {
      id: "4",
      title: "Team Meeting",
      team: "Eastside Eagles",
      teamLogo: "🦅",
      date: "2024-08-14",
      time: "2:45 PM",
      type: "meeting",
      location: "Team Room",
      rsvpRequired: false
    },
    {
      id: "5",
      title: "Skills Camp",
      team: "Spring Development",
      teamLogo: "🌱",
      date: "2024-08-18",
      time: "10:00 AM",
      type: "training",
      location: "Training Facility",
      rsvpRequired: true
    }
  ];

  // Sort events by date
  const sortedEvents = mockEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcomingEvents = sortedEvents.slice(0, 5);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'game': return 'bg-red-500';
      case 'practice': return 'bg-blue-500';
      case 'tournament': return 'bg-purple-500';
      case 'meeting': return 'bg-jade-500';
      case 'training': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'game': return '🏈';
      case 'practice': return '🏃‍♂️';
      case 'tournament': return '🏆';
      case 'meeting': return '🗣️';
      case 'training': return '💪';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="headline-md" className="text-gray-900 dark:text-white">
          📅 Upcoming Events
        </Typography>
        <button className="text-jade-600 dark:text-jade-400 hover:text-jade-700 dark:hover:text-jade-300">
          View Full Calendar
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-start space-x-3">
              {/* Event Type Icon */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${getEventColor(event.type)} rounded-full flex items-center justify-center text-white text-sm`}>
                  {getEventIcon(event.type)}
                </div>
              </div>
              
              {/* Event Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <Typography variant="body-sm" className="font-semibold text-gray-900 dark:text-white">
                    {event.title}
                  </Typography>
                  {event.rsvpRequired && (
                    <div className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs rounded-full">
                      RSVP
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-lg">{event.teamLogo}</span>
                  <Typography variant="body-sm" color="muted">
                    {event.team}
                  </Typography>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      📍 {event.location}
                    </span>
                  </div>
                  <div className="text-right">
                    <Typography variant="body-sm" className="font-medium">
                      {formatDate(event.date)}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {event.time}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2 text-jade-600 dark:text-jade-400 hover:bg-jade-50 dark:hover:bg-jade-900/20 rounded-md transition-colors">
            Add to Calendar
          </button>
          <button className="py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors">
            Event Settings
          </button>
        </div>
      </div>
    </Card>
  );
};
