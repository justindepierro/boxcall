import { describe, it, expect } from 'vitest';
import { baseNav, filterNav, type UserContext } from '../nav.schema';

describe('navigation schema', () => {
  it('returns all items for default context', () => {
    const ctx: UserContext = { role: 'coach', features: {} };
    const tree = filterNav(baseNav, ctx);
    expect(tree.length).toBeGreaterThan(3);
    expect(tree.some(i => i.id === 'dashboard')).toBe(true);
  });

  it('filters by feature flag', () => {
    const ctx: UserContext = { role: 'coach', features: { analytics: false } };
    const tree = filterNav([
      ...baseNav,
      { id: 'analytics', label: 'Analytics', path: '/analytics', icon: 'BarChart3', featureFlag: 'analytics' },
    ], ctx);
    expect(tree.find(i => i.id === 'analytics')).toBeUndefined();
  });

  it('filters by role', () => {
    const ctx: UserContext = { role: 'player', features: {} };
    const tree = filterNav([
      { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings', roles: ['coach', 'admin'] },
    ], ctx);
    expect(tree.length).toBe(0);
  });
});
