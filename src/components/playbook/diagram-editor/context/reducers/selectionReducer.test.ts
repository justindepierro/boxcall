import { describe, it, expect } from "vitest";
import { selectionReducer } from "./selectionReducer";

describe("selectionReducer", () => {
  it("returns state unchanged for unknown action", () => {
    const state = {} as any;
    const action = { type: "UNKNOWN" } as any;
    expect(selectionReducer(state, action)).toBe(state);
  });
});
