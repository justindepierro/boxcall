/**
 * Collaborative Diagram Store
 *
 * Extends the diagram store with real-time collaborative editing capabilities:
 * - Real-time synchronization via Supabase channels
 * - User presence tracking and cursors
 * - Optimistic updates with conflict resolution
 * - Collaborative cursors and selections
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "../../../../lib/supabase";
import { useDiagramStore } from "./diagramStore";
import type { Player } from "../types/Player";
import type { Route } from "../types/DiagramTypes";

export interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  color: string; // For cursor/selection colors
  lastSeen: Date;
  isOnline: boolean;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  timestamp: Date;
}

export interface CollaborativeSelection {
  userId: string;
  type: 'player' | 'route' | 'none';
  id: string | null; // playerId or routeId
  timestamp: Date;
}

export interface CollaborativeState {
  // Session info
  sessionId: string | null;
  currentUserId: string | null;

  // Users in session
  users: CollaborativeUser[];
  cursors: CursorPosition[];
  selections: CollaborativeSelection[];

  // Real-time connection
  isConnected: boolean;
  channel: any | null; // Supabase RealtimeChannel

  // Actions
  initializeSession: (diagramId: string, userId: string, userName: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  updateCursor: (x: number, y: number) => void;
  updateSelection: (type: 'player' | 'route' | 'none', id: string | null) => void;

  // Internal actions (not exposed to components)
  _handleRemoteUpdate: (update: any) => void;
  _broadcastUpdate: (update: any) => void;
  _addUser: (user: CollaborativeUser) => void;
  _removeUser: (userId: string) => void;
  _updateCursor: (cursor: CursorPosition) => void;
  _updateSelection: (selection: CollaborativeSelection) => void;
}

// Generate random color for user cursors/selections
function generateUserColor(): string {
  const colors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export const useCollaborativeStore = create<CollaborativeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    sessionId: null,
    currentUserId: null,
    users: [],
    cursors: [],
    selections: [],
    isConnected: false,
    channel: null,

    initializeSession: async (diagramId: string, userId: string, userName: string) => {
      const sessionId = `diagram-${diagramId}`;
      const userColor = generateUserColor();

      // Create Supabase realtime channel
      const channel = supabase.channel(sessionId, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Handle presence events
      channel
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users: CollaborativeUser[] = [];

          Object.keys(presenceState).forEach((key) => {
            const presences = presenceState[key];
            presences.forEach((presence: any) => {
              users.push({
                id: presence.user_id,
                name: presence.user_name || 'Anonymous',
                color: presence.user_color || '#666',
                lastSeen: new Date(presence.last_seen || Date.now()),
                isOnline: true,
              });
            });
          });

          set({ users });
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
          console.log('User left:', key, leftPresences);
          get()._removeUser(key);
        })
        .on('broadcast', { event: 'cursor' }, ({ payload }: any) => {
          get()._updateCursor(payload);
        })
        .on('broadcast', { event: 'selection' }, ({ payload }: any) => {
          get()._updateSelection(payload);
        })
        .on('broadcast', { event: 'diagram-update' }, ({ payload }) => {
          get()._handleRemoteUpdate(payload);
        });

      // Subscribe to channel
      await channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          // Track presence
          await channel.track({
            user_id: userId,
            user_name: userName,
            user_color: userColor,
            last_seen: new Date().toISOString(),
          });

          set({
            sessionId,
            currentUserId: userId,
            isConnected: true,
            channel,
          });

          console.log('✅ Joined collaborative session:', sessionId);
        }
      });
    },

    leaveSession: async () => {
      const { channel } = get();
      if (channel) {
        await channel.untrack();
        await supabase.removeChannel(channel);
      }

      set({
        sessionId: null,
        currentUserId: null,
        users: [],
        cursors: [],
        selections: [],
        isConnected: false,
        channel: null,
      });
    },

    updateCursor: (x: number, y: number) => {
      const { channel, currentUserId } = get();
      if (!channel || !currentUserId) return;

      const cursorUpdate: CursorPosition = {
        x,
        y,
        userId: currentUserId,
        timestamp: new Date(),
      };

      // Broadcast cursor position
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: cursorUpdate,
      });

      // Update local state immediately
      get()._updateCursor(cursorUpdate);
    },

    updateSelection: (type: 'player' | 'route' | 'none', id: string | null) => {
      const { channel, currentUserId } = get();
      if (!channel || !currentUserId) return;

      const selectionUpdate: CollaborativeSelection = {
        userId: currentUserId,
        type,
        id,
        timestamp: new Date(),
      };

      // Broadcast selection
      channel.send({
        type: 'broadcast',
        event: 'selection',
        payload: selectionUpdate,
      });

      // Update local state immediately
      get()._updateSelection(selectionUpdate);
    },

    // Internal handlers
    _handleRemoteUpdate: (update: any) => {
      // Handle remote diagram updates
      // This will be called when other users make changes
      const diagramStore = useDiagramStore.getState();

      switch (update.type) {
        case 'add-player':
          diagramStore.addPlayer(update.player);
          break;
        case 'update-player':
          diagramStore.updatePlayer(update.playerId, update.updates);
          break;
        case 'remove-player':
          diagramStore.removePlayer(update.playerId);
          break;
        case 'add-route':
          diagramStore.addRoute(update.route);
          break;
        case 'update-route':
          diagramStore.updateRoute(update.routeId, update.updates);
          break;
        case 'remove-route':
          diagramStore.removeRoute(update.routeId);
          break;
        // Add more cases as needed
      }
    },

    _broadcastUpdate: (update: any) => {
      const { channel } = get();
      if (!channel) return;

      channel.send({
        type: 'broadcast',
        event: 'diagram-update',
        payload: update,
      });
    },

    _addUser: (user: CollaborativeUser) => {
      set((state) => ({
        users: [...state.users.filter(u => u.id !== user.id), user],
      }));
    },

    _removeUser: (userId: string) => {
      set((state) => ({
        users: state.users.filter(u => u.id !== userId),
        cursors: state.cursors.filter(c => c.userId !== userId),
        selections: state.selections.filter(s => s.userId !== userId),
      }));
    },

    _updateCursor: (cursor: CursorPosition) => {
      set((state) => ({
        cursors: [
          ...state.cursors.filter(c => c.userId !== cursor.userId),
          cursor,
        ],
      }));
    },

    _updateSelection: (selection: CollaborativeSelection) => {
      set((state) => ({
        selections: [
          ...state.selections.filter(s => s.userId !== selection.userId),
          selection,
        ],
      }));
    },
  }))
);

// Collaborative hooks that wrap diagram store actions with real-time broadcasting
export const useCollaborativeDiagram = () => {
  const diagramStore = useDiagramStore();
  const collaborativeStore = useCollaborativeStore();

  return {
    ...diagramStore,

    // Override actions to broadcast changes
    addPlayer: (player: Player) => {
      diagramStore.addPlayer(player);
      collaborativeStore._broadcastUpdate({
        type: 'add-player',
        player,
      });
    },

    updatePlayer: (playerId: string, updates: Partial<Player>) => {
      diagramStore.updatePlayer(playerId, updates);
      collaborativeStore._broadcastUpdate({
        type: 'update-player',
        playerId,
        updates,
      });
    },

    removePlayer: (playerId: string) => {
      diagramStore.removePlayer(playerId);
      collaborativeStore._broadcastUpdate({
        type: 'remove-player',
        playerId,
      });
    },

    addRoute: (route: Route) => {
      diagramStore.addRoute(route);
      collaborativeStore._broadcastUpdate({
        type: 'add-route',
        route,
      });
    },

    updateRoute: (routeId: string, updates: Partial<Route>) => {
      diagramStore.updateRoute(routeId, updates);
      collaborativeStore._broadcastUpdate({
        type: 'update-route',
        routeId,
        updates,
      });
    },

    removeRoute: (routeId: string) => {
      diagramStore.removeRoute(routeId);
      collaborativeStore._broadcastUpdate({
        type: 'remove-route',
        routeId,
      });
    },
  };
};