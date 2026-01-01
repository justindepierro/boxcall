/**
 * Play Error Tests
 *
 * Tests for custom play error types and helper functions
 */

import { describe, it, expect } from "vitest";
import {
  PlayError,
  PlayValidationError,
  PlayDuplicateError,
  PlayRateLimitError,
  PlayNotFoundError,
  PlayPermissionError,
  isPlayError,
  isDuplicateError,
  isRateLimitError,
  getPlayErrorMessage,
  formatRetryTime,
} from "../../errors/playErrors";

describe("PlayError", () => {
  it("should create error with message and code", () => {
    const error = new PlayError("Test error", "TEST_CODE");
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_CODE");
    expect(error.name).toBe("PlayError");
  });
});

describe("PlayValidationError", () => {
  it("should create error with field and code", () => {
    const error = new PlayValidationError(
      "Field is required",
      "play_name",
      "REQUIRED"
    );
    expect(error.message).toBe("Field is required");
    expect(error.field).toBe("play_name");
    expect(error.code).toBe("REQUIRED");
    expect(error.name).toBe("PlayValidationError");
  });

  it("should have default code", () => {
    const error = new PlayValidationError("Field invalid", "formation");
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("should create from Zod error", () => {
    const zodError = {
      issues: [
        { path: ["play_name"], message: "Required" },
        { path: ["formation"], message: "Too long" },
      ],
    };

    const error = PlayValidationError.fromZodError(zodError);
    expect(error.field).toBe("play_name");
    expect(error.message).toBe("Required");
    expect(error.code).toBe("ZOD_VALIDATION");
  });
});

describe("PlayDuplicateError", () => {
  it("should create error with formation and play name", () => {
    const error = new PlayDuplicateError(undefined, "Shotgun", "Counter");
    expect(error.message).toContain("Counter");
    expect(error.message).toContain("Shotgun");
    expect(error.formation).toBe("Shotgun");
    expect(error.playName).toBe("Counter");
    expect(error.code).toBe("DUPLICATE_PLAY");
  });

  it("should create generic message without details", () => {
    const error = new PlayDuplicateError();
    expect(error.message).toContain("already exists");
  });

  it("should create from database error", () => {
    const error = PlayDuplicateError.fromDatabaseError("I-Form", "Dive");
    expect(error.formation).toBe("I-Form");
    expect(error.playName).toBe("Dive");
  });
});

describe("PlayRateLimitError", () => {
  it("should create error with retry time", () => {
    const error = new PlayRateLimitError(30);
    expect(error.retryAfterSeconds).toBe(30);
    expect(error.message).toContain("30");
    expect(error.code).toBe("RATE_LIMIT");
  });

  it("should default to 60 seconds", () => {
    const error = new PlayRateLimitError();
    expect(error.retryAfterSeconds).toBe(60);
  });
});

describe("PlayNotFoundError", () => {
  it("should create error with play ID", () => {
    const error = new PlayNotFoundError("abc-123");
    expect(error.playId).toBe("abc-123");
    expect(error.message).toContain("abc-123");
    expect(error.code).toBe("NOT_FOUND");
  });
});

describe("PlayPermissionError", () => {
  it("should create error with action and play ID", () => {
    const error = new PlayPermissionError("update", "abc-123");
    expect(error.action).toBe("update");
    expect(error.playId).toBe("abc-123");
    expect(error.message).toContain("update");
    expect(error.code).toBe("PERMISSION_DENIED");
  });

  it("should create generic message without play ID", () => {
    const error = new PlayPermissionError("create");
    expect(error.message).toContain("create");
    expect(error.playId).toBeUndefined();
  });
});

describe("isPlayError", () => {
  it("should return true for PlayError instances", () => {
    expect(isPlayError(new PlayError("test", "TEST"))).toBe(true);
    expect(isPlayError(new PlayValidationError("test", "field"))).toBe(true);
    expect(isPlayError(new PlayDuplicateError())).toBe(true);
    expect(isPlayError(new PlayRateLimitError())).toBe(true);
  });

  it("should return false for other errors", () => {
    expect(isPlayError(new Error("test"))).toBe(false);
    expect(isPlayError("string error")).toBe(false);
    expect(isPlayError(null)).toBe(false);
  });
});

describe("isDuplicateError", () => {
  it("should detect PlayDuplicateError", () => {
    expect(isDuplicateError(new PlayDuplicateError())).toBe(true);
  });

  it("should detect 23505 error code", () => {
    const dbError = new Error("Duplicate key violation") as Error & {
      code?: string;
    };
    dbError.code = "23505";
    expect(isDuplicateError(dbError)).toBe(true);
  });

  it("should detect error message containing 23505", () => {
    expect(isDuplicateError(new Error("Error code 23505"))).toBe(true);
  });

  it("should return false for other errors", () => {
    expect(isDuplicateError(new Error("Network error"))).toBe(false);
  });
});

describe("isRateLimitError", () => {
  it("should detect PlayRateLimitError", () => {
    expect(isRateLimitError(new PlayRateLimitError())).toBe(true);
  });

  it("should detect rate limit in message", () => {
    expect(isRateLimitError(new Error("Rate limit exceeded"))).toBe(true);
    expect(isRateLimitError(new Error("Creating too quickly"))).toBe(true);
  });

  it("should return false for other errors", () => {
    expect(isRateLimitError(new Error("Network error"))).toBe(false);
  });
});

describe("getPlayErrorMessage", () => {
  it("should return message from PlayError", () => {
    const error = new PlayValidationError("Custom message", "field");
    expect(getPlayErrorMessage(error)).toBe("Custom message");
  });

  it("should format Zod errors", () => {
    const zodError = {
      issues: [
        { message: "Required", path: ["play_name"] },
        { message: "Too long", path: ["formation"] },
      ],
    };
    expect(getPlayErrorMessage(zodError)).toBe("Required, Too long");
  });

  it("should handle 23505 database error", () => {
    const dbError = new Error("Error") as Error & { code?: string };
    dbError.code = "23505";
    expect(getPlayErrorMessage(dbError)).toContain("already exists");
  });

  it("should return generic message for unknown errors", () => {
    expect(getPlayErrorMessage(new Error("Unknown"))).toBe(
      "Something went wrong. Please try again."
    );
  });
});

describe("formatRetryTime", () => {
  it("should format seconds", () => {
    expect(formatRetryTime(30)).toBe("30 seconds");
    expect(formatRetryTime(1)).toBe("1 second");
  });

  it("should format minutes", () => {
    expect(formatRetryTime(60)).toBe("1 minute");
    expect(formatRetryTime(120)).toBe("2 minutes");
    expect(formatRetryTime(90)).toBe("2 minutes"); // Rounds up
  });
});
