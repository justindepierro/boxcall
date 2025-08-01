import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { expect } from "vitest";
import { AppProviders } from "../../src/app/providers";
import {
  useAppStore,
  type Player,
  type Team,
  type User,
} from "../../src/app/store";

// Test utilities for wrapping components with providers
export function renderWithProviders(component: ReactElement) {
  return render(component, {
    wrapper: AppProviders,
  });
}

// Test utilities for Zustand store
export function createMockStore() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    currentTeamId: null,
    currentTeam: null,
    teams: [],
    players: {},
    theme: "light" as const,
    sidebarOpen: false,
    notifications: [],
    error: null,
  };
}

// Helper to reset store state between tests
export function resetStore() {
  const store = useAppStore.getState();
  store.logout();
  store.clearError();
  store.setTheme("light");
}

// Mock user data for testing
export const mockUser = {
  id: "user-1",
  email: "coach@example.com",
  name: "Coach Smith",
  role: "head_coach" as const,
  teamIds: ["team-1"],
};

export const mockTeam = {
  id: "team-1",
  name: "Eagles Football",
  season: "2025",
  level: "high_school" as const,
  headCoachId: "user-1",
  assistantCoaches: [],
  players: ["player-1", "player-2"],
  settings: {
    theme: "light" as const,
    primaryColor: "#1e40af",
    secondaryColor: "#64748b",
    allowParentAccess: true,
    enableAI: true,
    enableRealTime: true,
  },
};

export const mockPlayer = {
  id: "player-1",
  name: "John Doe",
  jersey: 12,
  position: "QB",
  grade: 11,
  height: "6'2\"",
  weight: 185,
  parentEmails: ["parent@example.com"],
  stats: {
    gamesPlayed: 8,
    touchdowns: 15,
    yards: 2100,
    tackles: 0,
  },
};

// Custom assertions for football-specific testing
export function expectValidTeam(team: unknown) {
  expect(team).toHaveProperty("id");
  expect(team).toHaveProperty("name");
  expect(team).toHaveProperty("season");
  expect(team).toHaveProperty("level");
  expect(team).toHaveProperty("headCoachId");
  expect((team as Team).level).toMatch(
    /^(youth|middle_school|high_school|college|professional)$/
  );
}

export function expectValidPlayer(player: unknown) {
  expect(player).toHaveProperty("id");
  expect(player).toHaveProperty("name");
  expect(player).toHaveProperty("jersey");
  expect(player).toHaveProperty("position");
  expect(player).toHaveProperty("stats");
  expect(typeof (player as Player).jersey).toBe("number");
  expect((player as Player).jersey).toBeGreaterThan(0);
  expect((player as Player).jersey).toBeLessThanOrEqual(99);
}

export function expectValidUser(user: unknown) {
  expect(user).toHaveProperty("id");
  expect(user).toHaveProperty("email");
  expect(user).toHaveProperty("name");
  expect(user).toHaveProperty("role");
  expect((user as User).role).toMatch(
    /^(head_coach|assistant_coach|player|manager|parent)$/
  );
}
