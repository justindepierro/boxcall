import { describe, it, expect } from "vitest";
import { routeReducer } from "./routeReducer";

describe("routeReducer", () => {
  it("returns state unchanged for unknown action", () => {
    const state = {} as any;
    const action = { type: "UNKNOWN" } as any;
    expect(routeReducer(state, action)).toBe(state);
  });
});
