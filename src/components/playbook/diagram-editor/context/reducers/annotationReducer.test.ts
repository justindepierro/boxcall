import { describe, it, expect } from "vitest";
import { annotationReducer } from "./annotationReducer";

describe("annotationReducer", () => {
  it("returns state unchanged for unknown action", () => {
    const state = {} as any;
    const action = { type: "UNKNOWN" } as any;
    expect(annotationReducer(state, action)).toBe(state);
  });
});
