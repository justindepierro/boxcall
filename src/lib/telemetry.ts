// Minimal telemetry utility (can be expanded later)
export type TelemetryEvent = {
  name: string;
  ts: number;
  props?: Record<string, unknown>;
};

const queue: TelemetryEvent[] = [];

function emit(name: string, props?: Record<string, unknown>) {
  const evt: TelemetryEvent = { name, ts: Date.now(), props };
  queue.push(evt);
  if (import.meta.env.DEV) {
// console.debug("[telemetry]", evt);
  }
}

export const telemetry = {
  track(name: string, props?: Record<string, unknown>) {
    emit(name, props);
  },
  onboardingView(context: string) {
    emit("onboarding.view", { context });
  },
  onboardingAction(actionId: string) {
    emit("onboarding.action.click", { actionId });
  },
  drain(): TelemetryEvent[] {
    return queue.splice(0, queue.length);
  },
};

// Creation / action lifecycle helpers (Step 9 expansion)
// These provide a consistent naming convention for started/succeeded/failed events
// so components can easily instrument without duplicating strings.
type Lifecycle = "started" | "succeeded" | "failed";
// Generic, indexable telemetry prop shape; unknown values enforce explicit narrowing at call sites.
export type TelemetryProps = Record<string, unknown>;

const lifecycleEvent = (
  domain: string,
  action: string,
  phase: Lifecycle,
  extra?: TelemetryProps
) => {
  telemetry.track(`${domain}.${action}.${phase}`, extra);
};

export const postCreateStarted = (data?: TelemetryProps) =>
  lifecycleEvent("post", "create", "started", data);
export const postCreateSucceeded = (data?: TelemetryProps) =>
  lifecycleEvent("post", "create", "succeeded", data);
export const postCreateFailed = (data?: TelemetryProps) =>
  lifecycleEvent("post", "create", "failed", data);

export const eventCreateStarted = (data?: TelemetryProps) =>
  lifecycleEvent("event", "create", "started", data);
export const eventCreateSucceeded = (data?: TelemetryProps) =>
  lifecycleEvent("event", "create", "succeeded", data);
export const eventCreateFailed = (data?: TelemetryProps) =>
  lifecycleEvent("event", "create", "failed", data);

export const gameResultLogStarted = (data?: TelemetryProps) =>
  lifecycleEvent("game_result", "log", "started", data);
export const gameResultLogSucceeded = (data?: TelemetryProps) =>
  lifecycleEvent("game_result", "log", "succeeded", data);
export const gameResultLogFailed = (data?: TelemetryProps) =>
  lifecycleEvent("game_result", "log", "failed", data);

export const telemetryLifecycle = {
  post: {
    create: {
      started: postCreateStarted,
      succeeded: postCreateSucceeded,
      failed: postCreateFailed,
    },
  },
  event: {
    create: {
      started: eventCreateStarted,
      succeeded: eventCreateSucceeded,
      failed: eventCreateFailed,
    },
  },
  gameResult: {
    log: {
      started: gameResultLogStarted,
      succeeded: gameResultLogSucceeded,
      failed: gameResultLogFailed,
    },
  },
};

// Backward-compatible helper (legacy import sites still use emitTelemetry)
export function emitTelemetry(name: string, props?: Record<string, unknown>) {
  telemetry.track(name, props);
}

export type Telemetry = typeof telemetry;
