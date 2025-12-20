export const DEV_PANEL_CONTROL_EVENT = "boxcall:devpanel-control" as const;

export type DevPanelControlAction = "open" | "close" | "toggle";

export type DevPanelControlDetail = {
  action: DevPanelControlAction;
  source?: string;
};

export function requestDevPanelControl(detail: DevPanelControlDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DevPanelControlDetail>(DEV_PANEL_CONTROL_EVENT, { detail }));
}
