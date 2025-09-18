import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  authorize,
  type SubscriptionTier as DbSubscriptionTier,
  type TeamMemberRole as DbTeamMemberRole,
  type AppRole,
} from "../authorize";

// Basic supabase mocks for membership/subscription queries used by authorize
type TeamMemberRow = {
  role: DbTeamMemberRole;
  status: "active" | "inactive" | "pending" | null;
};
type TeamRow = {
  subscription_tier: DbSubscriptionTier | null;
  subscription_expires_at: string | null;
};

const hoisted = vi.hoisted(() => ({
  teamMember: null as TeamMemberRow | null,
  subscription: null as TeamRow | null,
}));

type MockQuery = {
  eq: (col?: string, val?: unknown) => MockQuery;
  single: () => Promise<unknown>;
};

vi.mock("../../lib/supabase", () => ({
  supabase: {
    from: (table: string) => ({
      select: () => {
        const chain: MockQuery = {
          eq: () => chain,
          single: async () => {
            if (table === "team_members") {
              return { data: hoisted.teamMember, error: null } as {
                data: TeamMemberRow | null;
                error: unknown;
              };
            }
            if (table === "teams") {
              return { data: hoisted.subscription, error: null } as {
                data: TeamRow | null;
                error: unknown;
              };
            }
            return { data: null, error: null } as {
              data: null;
              error: unknown;
            };
          },
        };
        return chain;
      },
    }),
  },
}));

describe("authorize()", () => {
  beforeEach(() => {
    hoisted.teamMember = null;
    hoisted.subscription = null;
  });

  const profile: { id: string; role: AppRole } = {
    id: "u1",
    role: "coach" as AppRole,
  };

  it("blocks when unauthenticated", async () => {
    const res = await authorize({ profile: null });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("unauthenticated");
  });

  it("allows when requiredRoles includes user's role", async () => {
    const res = await authorize({
      profile,
      requiredRoles: ["coach", "admin"],
    });
    expect(res.allowed).toBe(true);
    expect(res.reason).toBeUndefined();
  });

  it("denies with role_denied when requiredRoles excludes user's role", async () => {
    const res = await authorize({
      profile: { id: "u1", role: "player" as AppRole },
      requiredRoles: ["coach", "admin"],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("role_denied");
  });

  it("allows super admin bypass", async () => {
    const res = await authorize({
      profile,
      isSuperAdmin: true,
      teamFeature: "dashboard",
      teamId: "t1",
    });
    expect(res.allowed).toBe(true);
  });

  it("requires team context when constraints need it", async () => {
    const res = await authorize({
      profile,
      requiredPermissions: ["dashboard.view_team"],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("no_team");
  });

  it("denies when not a team member", async () => {
    const res = await authorize({
      profile,
      teamId: "t1",
      requiredPermissions: ["dashboard.view_team"],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("not_member");
  });

  it("denies when inactive member", async () => {
    hoisted.teamMember = {
      role: "coach" as DbTeamMemberRole,
      status: "inactive",
    };
    const res = await authorize({
      profile,
      teamId: "t1",
      requiredPermissions: ["dashboard.view_team"],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("inactive_member");
  });

  it("checks subscription tier and expiry", async () => {
    hoisted.teamMember = {
      role: "coach" as DbTeamMemberRole,
      status: "active",
    };
    // wrong tier
    hoisted.subscription = {
      subscription_tier: "free" as DbSubscriptionTier,
      subscription_expires_at: null,
    };
    let res = await authorize({
      profile,
      teamId: "t1",
      requiredTiers: ["team_premium" as NonNullable<DbSubscriptionTier>],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("subscription_tier");

    // expired
    const past = new Date(Date.now() - 86400000).toISOString();
    hoisted.subscription = {
      subscription_tier: "team_premium" as DbSubscriptionTier,
      subscription_expires_at: past,
    };
    res = await authorize({
      profile,
      teamId: "t1",
      requiredTiers: ["team_premium" as NonNullable<DbSubscriptionTier>],
    });
    expect(res.allowed).toBe(false);
    expect(res.reason).toBe("subscription_expired");
  });

  it("passes permission matrix when conditions satisfied", async () => {
    hoisted.teamMember = {
      role: "coach" as DbTeamMemberRole,
      status: "active",
    };
    hoisted.subscription = {
      subscription_tier: "staff_addon" as DbSubscriptionTier,
      subscription_expires_at: null,
    };
    const res = await authorize({
      profile,
      teamId: "t1",
      requiredTiers: ["staff_addon" as NonNullable<DbSubscriptionTier>],
      requiredPermissions: ["playbook.create"],
    });
    expect(res.allowed).toBe(true);
  });
});
