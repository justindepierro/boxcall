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
    console.debug("[telemetry]", evt);
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

export type Telemetry = typeof telemetry;
