// Calendar Permissions Management for Phase 2.3
// Role-based permissions and team access control

import React, { useState } from 'react';
import { useCalendarPermissions, usePermissionCheck } from '../hooks/useEnhancedCalendar';
import type { 
  CalendarRole, 
  CalendarPermission, 
  CalendarPermissions,
  PermissionCheck
} from '../types/enhanced-calendar';

interface CalendarPermissionsManagerProps {
  teamId: string;
  currentUserId: string;
  currentUserRole: CalendarRole;
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    current_role?: CalendarRole;
  }>;
}

export function CalendarPermissionsManager({
  teamId,
  currentUserId,
  currentUserRole,
  teamMembers
}: CalendarPermissionsManagerProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);

  const canManagePermissions = ['owner', 'head_coach'].includes(currentUserRole);

  if (!canManagePermissions) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-yellow-700">
            You don't have permission to manage calendar permissions. Contact a team owner or head coach.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Calendar Permissions</h3>
          <p className="text-sm text-gray-600">
            Manage who can create, edit, and manage calendar events
          </p>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add User
        </button>
      </div>

      {/* Role Descriptions */}
      <RoleDescriptions />

      {/* Team Members List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-md font-medium text-gray-900">Team Members</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {teamMembers.map((member) => (
            <MemberPermissionRow
              key={member.id}
              member={member}
              teamId={teamId}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              isSelected={selectedMember === member.id}
              onSelect={() => setSelectedMember(member.id === selectedMember ? null : member.id)}
            />
          ))}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <AddUserModal
          teamId={teamId}
          onClose={() => setShowAddUser(false)}
          onUserAdded={() => {
            setShowAddUser(false);
            // TODO: Refresh team members list
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// ROLE DESCRIPTIONS
// ============================================================================

function RoleDescriptions() {
  const roles: Array<{
    role: CalendarRole;
    title: string;
    description: string;
    color: string;
  }> = [
    {
      role: 'owner',
      title: 'Owner',
      description: 'Full access to all calendar features and permissions management',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      role: 'head_coach',
      title: 'Head Coach',
      description: 'Can manage all events, practices, and team coordination',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      role: 'assistant_coach',
      title: 'Assistant Coach',
      description: 'Can create and edit events, manage practice plans',
      color: 'bg-green-100 text-green-800'
    },
    {
      role: 'team_captain',
      title: 'Team Captain',
      description: 'Can create events and help coordinate team activities',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      role: 'player',
      title: 'Player',
      description: 'Can respond to events and view calendar',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      role: 'parent',
      title: 'Parent/Guardian',
      description: 'Can respond to events for their children',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      role: 'viewer',
      title: 'Viewer',
      description: 'Read-only access to calendar events',
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-md font-medium text-gray-900 mb-3">Role Permissions</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {roles.map((roleInfo) => (
          <div key={roleInfo.role} className="bg-white rounded border border-gray-200 p-3">
            <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${roleInfo.color} mb-2`}>
              {roleInfo.title}
            </div>
            <p className="text-sm text-gray-600">{roleInfo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MEMBER PERMISSION ROW
// ============================================================================

interface MemberPermissionRowProps {
  member: {
    id: string;
    name: string;
    email: string;
    current_role?: CalendarRole;
  };
  teamId: string;
  currentUserId: string;
  currentUserRole: CalendarRole;
  isSelected: boolean;
  onSelect: () => void;
}

function MemberPermissionRow({
  member,
  teamId,
  currentUserId,
  currentUserRole,
  isSelected,
  onSelect
}: MemberPermissionRowProps) {
  const { permissions, loading, updatePermissions, revokePermissions } = useCalendarPermissions(member.id, teamId);
  const { checkPermission } = usePermissionCheck();
  const [updating, setUpdating] = useState(false);

  const canEditThisMember = async () => {
    if (member.id === currentUserId) return false; // Can't edit yourself
    
    const check: PermissionCheck = {
      user_id: currentUserId,
      team_id: teamId,
      permission: 'manage_permissions'
    };

    try {
      const result = await checkPermission(check);
      return result.allowed;
    } catch {
      return false;
    }
  };

  const handleRoleChange = async (newRole: CalendarRole) => {
    const canEdit = await canEditThisMember();
    if (!canEdit) return;

    setUpdating(true);
    try {
      await updatePermissions(newRole);
    } catch (error) {
      console.error('Failed to update permissions:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleRevoke = async () => {
    const canEdit = await canEditThisMember();
    if (!canEdit) return;

    if (confirm(`Are you sure you want to revoke calendar permissions for ${member.name}?`)) {
      setUpdating(true);
      try {
        await revokePermissions();
      } catch (error) {
        console.error('Failed to revoke permissions:', error);
      } finally {
        setUpdating(false);
      }
    }
  };

  const currentRole = permissions?.role || member.current_role || 'viewer';
  const isCurrentUser = member.id === currentUserId;

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {member.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900">
                {member.name}
                {isCurrentUser && <span className="text-gray-500">(You)</span>}
              </p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                currentRole === 'owner' ? 'bg-purple-100 text-purple-800' :
                currentRole === 'head_coach' ? 'bg-blue-100 text-blue-800' :
                currentRole === 'assistant_coach' ? 'bg-green-100 text-green-800' :
                currentRole === 'team_captain' ? 'bg-yellow-100 text-yellow-800' :
                currentRole === 'player' ? 'bg-gray-100 text-gray-800' :
                currentRole === 'parent' ? 'bg-pink-100 text-pink-800' :
                'bg-gray-100 text-gray-600'
              }`}>
                {currentRole.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isCurrentUser && (
            <>
              <RoleSelector
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                disabled={updating || loading}
                canEdit={currentUserRole === 'owner' || currentUserRole === 'head_coach'}
              />
              <button
                onClick={onSelect}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {isSelected ? 'Hide' : 'Details'}
              </button>
              <button
                onClick={handleRevoke}
                disabled={updating || loading}
                className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                Revoke
              </button>
            </>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {isSelected && permissions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <PermissionDetails permissions={permissions} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ROLE SELECTOR
// ============================================================================

interface RoleSelectorProps {
  currentRole: CalendarRole;
  onRoleChange: (role: CalendarRole) => void;
  disabled: boolean;
  canEdit: boolean;
}

function RoleSelector({ currentRole, onRoleChange, disabled, canEdit }: RoleSelectorProps) {
  if (!canEdit) {
    return (
      <span className="text-sm text-gray-500">
        {currentRole.replace('_', ' ')}
      </span>
    );
  }

  const roles: CalendarRole[] = [
    'owner',
    'head_coach',
    'assistant_coach',
    'team_captain',
    'player',
    'parent',
    'viewer'
  ];

  return (
    <select
      value={currentRole}
      onChange={(e) => onRoleChange(e.target.value as CalendarRole)}
      disabled={disabled}
      className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
    >
      {roles.map((role) => (
        <option key={role} value={role}>
          {role.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}

// ============================================================================
// PERMISSION DETAILS
// ============================================================================

interface PermissionDetailsProps {
  permissions: CalendarPermissions;
}

function PermissionDetails({ permissions }: PermissionDetailsProps) {
  const permissionGroups: Record<string, CalendarPermission[]> = {
    'Event Management': [
      'create_events',
      'edit_events',
      'delete_events',
      'publish_events'
    ],
    'Practice Management': [
      'create_practices',
      'edit_practice_plans',
      'manage_attendance'
    ],
    'Team Coordination': [
      'create_polls',
      'view_poll_results',
      'manage_rsvps',
      'send_notifications'
    ],
    'Administrative': [
      'bulk_operations',
      'manage_permissions',
      'view_analytics',
      'access_private_notes'
    ]
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">
        <p><strong>Role:</strong> {permissions.role.replace('_', ' ')}</p>
        <p><strong>Granted by:</strong> {permissions.granted_by}</p>
        <p><strong>Granted on:</strong> {new Date(permissions.granted_at).toLocaleDateString()}</p>
        {permissions.expires_at && (
          <p><strong>Expires:</strong> {new Date(permissions.expires_at).toLocaleDateString()}</p>
        )}
      </div>

      <div>
        <h5 className="text-sm font-medium text-gray-900 mb-2">Specific Permissions</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(permissionGroups).map(([groupName, groupPermissions]) => {
            const hasAnyPermission = groupPermissions.some(perm => 
              permissions.permissions.includes(perm)
            );
            
            if (!hasAnyPermission) return null;

            return (
              <div key={groupName} className="bg-gray-50 rounded-lg p-3">
                <h6 className="text-xs font-medium text-gray-700 mb-2">{groupName}</h6>
                <div className="space-y-1">
                  {groupPermissions.map((permission) => {
                    const hasPermission = permissions.permissions.includes(permission);
                    if (!hasPermission) return null;

                    return (
                      <div key={permission} className="flex items-center text-xs text-green-700">
                        <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {permission.replace('_', ' ')}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD USER MODAL
// ============================================================================

interface AddUserModalProps {
  teamId: string;
  onClose: () => void;
  onUserAdded: () => void;
}

function AddUserModal({ teamId, onClose, onUserAdded }: AddUserModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CalendarRole>('player');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement user invitation logic
      console.log('Inviting user:', { email, role, teamId });
      onUserAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Add Team Member
                  </h3>
                  
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Calendar Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as CalendarRole)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="player">Player</option>
                        <option value="parent">Parent/Guardian</option>
                        <option value="team_captain">Team Captain</option>
                        <option value="assistant_coach">Assistant Coach</option>
                        <option value="head_coach">Head Coach</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
