// Enhanced Team Features Page - Phase 2.3
// Main interface combining polling, advanced RSVP, permissions, and bulk operations

import React, { useState } from 'react';
import { EventPollingInterface } from '../components/EventPollingInterface';
import { AdvancedRSVPInterface } from '../components/AdvancedRSVPInterface';
import { CalendarPermissionsManager } from '../components/CalendarPermissionsManager';
import { BulkOperationsInterface } from '../components/BulkOperationsInterface';
import type { CalendarRole } from '../types/enhanced-calendar';

interface EnhancedTeamFeaturesPageProps {
  teamId: string;
  currentUserId: string;
  userRole: CalendarRole;
  selectedEventId?: string;
}

export function EnhancedTeamFeaturesPage({
  teamId,
  currentUserId,
  userRole,
  selectedEventId
}: EnhancedTeamFeaturesPageProps) {
  const [activeTab, setActiveTab] = useState<'polling' | 'rsvp' | 'permissions' | 'bulk'>('polling');
  const selectedEventIds = selectedEventId ? [selectedEventId] : [];

  // Mock team members data - in real app, this would come from a hook
  const teamMembers = [
    { id: 'user1', name: 'John Coach', email: 'john@example.com', current_role: 'head_coach' as CalendarRole },
    { id: 'user2', name: 'Jane Player', email: 'jane@example.com', current_role: 'player' as CalendarRole },
    { id: 'user3', name: 'Bob Parent', email: 'bob@example.com', current_role: 'parent' as CalendarRole },
    { id: currentUserId, name: 'Current User', email: 'current@example.com', current_role: userRole }
  ];

  const tabs = [
    {
      id: 'polling' as const,
      name: 'Event Polling',
      description: 'Create and manage team polls',
      icon: '📊',
      available: true
    },
    {
      id: 'rsvp' as const,
      name: 'Advanced RSVP',
      description: 'Enhanced response system',
      icon: '✅',
      available: !!selectedEventId
    },
    {
      id: 'permissions' as const,
      name: 'Permissions',
      description: 'Manage team access',
      icon: '🔐',
      available: ['owner', 'head_coach'].includes(userRole)
    },
    {
      id: 'bulk' as const,
      name: 'Bulk Operations',
      description: 'Mass event operations',
      icon: '⚡',
      available: ['owner', 'head_coach', 'assistant_coach'].includes(userRole)
    }
  ];

  const availableTabs = tabs.filter(tab => tab.available);

  // Auto-select first available tab if current tab is not available
  React.useEffect(() => {
    if (!availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id || 'polling');
    }
  }, [activeTab, availableTabs]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'polling':
        if (!selectedEventId) {
          return (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Event Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an event from the calendar to create and manage polls.
              </p>
            </div>
          );
        }
        return (
          <EventPollingInterface
            eventId={selectedEventId}
            userId={currentUserId}
            userRole={userRole === 'owner' || userRole === 'head_coach' || userRole === 'assistant_coach' ? 'coach' : 
                     userRole === 'parent' || userRole === 'parent_admin' ? 'parent' : 'player'}
            canCreatePolls={['owner', 'head_coach', 'assistant_coach'].includes(userRole)}
          />
        );

      case 'rsvp':
        if (!selectedEventId) {
          return (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Event Selected</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select an event from the calendar to manage advanced RSVP features.
              </p>
            </div>
          );
        }
        return (
          <AdvancedRSVPInterface
            eventId={selectedEventId}
            userId={currentUserId}
            userRole={userRole === 'owner' || userRole === 'head_coach' || userRole === 'assistant_coach' ? 'coach' : 
                     userRole === 'parent' || userRole === 'parent_admin' ? 'parent' : 'player'}
            isRequired={true}
            allowConditional={true}
            allowDetailedResponse={true}
            requireEmergencyContact={false}
            allowGroupResponses={userRole === 'parent' || userRole === 'parent_admin'}
          />
        );

      case 'permissions':
        return (
          <CalendarPermissionsManager
            teamId={teamId}
            currentUserId={currentUserId}
            currentUserRole={userRole}
            teamMembers={teamMembers}
          />
        );

      case 'bulk':
        return (
          <BulkOperationsInterface
            teamId={teamId}
            selectedEventIds={selectedEventIds}
            userRole={userRole === 'owner' || userRole === 'head_coach' || userRole === 'assistant_coach' ? 'coach' : 
                     userRole === 'parent' || userRole === 'parent_admin' ? 'parent' : 'player'}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Enhanced Team Features</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Advanced calendar management tools for team coordination
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Role:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userRole === 'owner' ? 'bg-purple-100 text-purple-800' :
                  userRole === 'head_coach' ? 'bg-blue-100 text-blue-800' :
                  userRole === 'assistant_coach' ? 'bg-green-100 text-green-800' :
                  userRole === 'team_captain' ? 'bg-yellow-100 text-yellow-800' :
                  userRole === 'player' ? 'bg-gray-100 text-gray-800' :
                  userRole === 'parent' ? 'bg-pink-100 text-pink-800' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {userRole.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{tab.name}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Feature Status */}
            <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Phase 2.3 Features</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Team Polling</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Advanced RSVP</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Permissions</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Bulk Operations</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-gray-200 min-h-[600px]">
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Selection Helper */}
      {(activeTab === 'polling' || activeTab === 'rsvp') && !selectedEventId && (
        <div className="fixed bottom-4 right-4 max-w-sm">
          <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium">Need to select an event?</p>
                <p className="text-xs opacity-90">Go to your calendar to choose an event first.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DEMO INTEGRATION WRAPPER
// ============================================================================

// This wrapper provides mock data for demonstration purposes
export function EnhancedTeamFeaturesDemoPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>('demo_event_123');
  
  return (
    <div>
      {/* Demo Event Selector */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Demo Mode:</strong> This is a demonstration of Phase 2.3 Enhanced Team Features.
            </p>
            <div className="mt-2">
              <label className="block text-xs font-medium text-yellow-700 mb-1">
                Demo Event Selection:
              </label>
              <select
                value={selectedEventId || ''}
                onChange={(e) => setSelectedEventId(e.target.value || undefined)}
                className="text-xs border-yellow-300 rounded focus:ring-yellow-500 focus:border-yellow-500"
              >
                <option value="">No Event Selected</option>
                <option value="demo_event_123">Saturday Game vs Eagles</option>
                <option value="demo_event_456">Wednesday Practice</option>
                <option value="demo_event_789">Team Meeting</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <EnhancedTeamFeaturesPage
        teamId="demo_team_123"
        currentUserId="demo_user_123"
        userRole="head_coach"
        selectedEventId={selectedEventId}
      />
    </div>
  );
}
