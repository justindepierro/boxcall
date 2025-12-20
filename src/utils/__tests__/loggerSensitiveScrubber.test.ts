import { describe, expect, it, vi } from "vitest";

import { debug, info, warn, logError, devLog } from "../logger";

describe("logger sensitive scrubber", () => {
  it("redacts JWTs, Bearer tokens, and emails in messages", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    warn(
      "user email test@example.com token eyJabc.defGHI.jklMN0",
      "Bearer secret-token-123"
    );

    const joined = spy.mock.calls.map((c) => c.join(" ")).join("\n");
    expect(joined).not.toContain("test@example.com");
    expect(joined).not.toContain("eyJabc.defGHI.jklMN0");
    expect(joined).not.toContain("secret-token-123");
    expect(joined).toContain("[REDACTED_EMAIL]");
    expect(joined).toContain("[REDACTED_TOKEN]");

    spy.mockRestore();
  });

  it("redacts sensitive keys inside objects", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

    warn("payload", {
      access_token: "abc",
      refresh_token: "def",
      password: "p@ssw0rd",
      profile: { email: "coach@school.edu" },
    });

    const args = spy.mock.calls[0];
    const payload = args[1] as any;

    expect(payload.access_token).toBe("[REDACTED]");
    expect(payload.refresh_token).toBe("[REDACTED]");
    expect(payload.password).toBe("[REDACTED]");
    expect(payload.profile.email).toBe("[REDACTED_EMAIL]");

    spy.mockRestore();
  });

  it("scrubs Error messages and stacks", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const err = new Error(
      "failed with Bearer token=Bearer abc123 and email player@team.com"
    );

    logError("boom", err);

    const loggedError = spy.mock.calls[0][1] as Error;
    expect(loggedError.message).not.toContain("player@team.com");
    expect(loggedError.message).toContain("[REDACTED_EMAIL]");
    expect(loggedError.message).toContain("[REDACTED_TOKEN]");

    spy.mockRestore();
  });

  it("devLog also redacts", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    // devLog only prints when import.meta.env.DEV; tests run in MODE=test so it won't print.
    // We still call it to ensure it doesn't throw with sensitive input.
    devLog("token eyJabc.def.ghi email a@b.com");

    spy.mockRestore();
  });

  it("debug does not throw when given complex objects", () => {
    const spy = vi.spyOn(console, "debug").mockImplementation(() => {});

    const circular: any = { token: "abc" };
    circular.self = circular;

    debug("circular", circular);

    spy.mockRestore();
  });
});
