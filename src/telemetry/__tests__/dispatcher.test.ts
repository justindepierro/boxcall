import { describe, it, expect, vi, beforeEach } from "vitest";
import { TelemetryDispatcher } from "../dispatcher";

describe("TelemetryDispatcher", () => {
  let dispatcher: TelemetryDispatcher;
  let onFlush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onFlush = vi.fn();
    dispatcher = new TelemetryDispatcher({
      flushIntervalMs: 10,
      maxBuffer: 3,
      onFlush,
    });
  });

  it("buffers and flushes on maxBuffer", () => {
    dispatcher.enqueue({ type: "test.a" });
    dispatcher.enqueue({ type: "test.b" });
    dispatcher.enqueue({ type: "test.c" }); // triggers flush
    expect(onFlush).toHaveBeenCalledTimes(1);
    const events: { type: string; ts: number }[] = onFlush.mock.calls[0][0];
    expect(events).toHaveLength(3);
    expect(events.map((e) => e.type)).toEqual(["test.a", "test.b", "test.c"]);
  });

  it("flushes after interval", async () => {
    dispatcher.enqueue({ type: "test.delayed" });
    await new Promise((r) => setTimeout(r, 25));
    expect(onFlush).toHaveBeenCalledTimes(1);
    const events = onFlush.mock.calls[0][0];
    expect(events[0].type).toBe("test.delayed");
  });

  it("shutdown flushes remaining events", () => {
    dispatcher.enqueue({ type: "test.shutdown" });
    dispatcher.shutdown();
    expect(onFlush).toHaveBeenCalledTimes(1);
    const events = onFlush.mock.calls[0][0];
    expect(events[0].type).toBe("test.shutdown");
  });
});
