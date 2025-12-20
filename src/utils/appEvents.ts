/* eslint-disable no-redeclare -- TypeScript function overloads are intentional */

export const ACTIVATION_FLAG_SET_EVENT = "activation:flag_set" as const;

export type ActivationFlagId =
  | "first_play"
  | "first_practice"
  | "first_script_export";

export type ActivationFlagSetDetail = {
  id: ActivationFlagId;
};

export const OPEN_PLAY_BUILDER_EVENT = "open-play-builder" as const;
export const OPEN_PRACTICE_PLANNER_EVENT = "open-practice-planner" as const;

export const PWA_INSTALL_AVAILABLE_EVENT = "pwa:install-available" as const;

export type PwaInstallAvailableDetail = {
  available: boolean;
};

export const PLAYGRID_OPEN_IMPORT_EVENT = "playgrid:open-import" as const;
export const PLAYGRID_CLEAR_FILTERS_EVENT = "playgrid:clear-filters" as const;

type KeysWithDetail<M extends Record<string, unknown>> = {
  [K in keyof M]-?: M[K] extends undefined ? never : K;
}[keyof M];

type KeysWithoutDetail<M extends Record<string, unknown>> = {
  [K in keyof M]-?: M[K] extends undefined ? K : never;
}[keyof M];

export type WindowAppEventDetailMap = {
  [ACTIVATION_FLAG_SET_EVENT]: ActivationFlagSetDetail;
  [OPEN_PLAY_BUILDER_EVENT]: undefined;
  [OPEN_PRACTICE_PLANNER_EVENT]: undefined;
  [PWA_INSTALL_AVAILABLE_EVENT]: PwaInstallAvailableDetail;
};

export type DocumentAppEventDetailMap = {
  [PLAYGRID_OPEN_IMPORT_EVENT]: undefined;
  [PLAYGRID_CLEAR_FILTERS_EVENT]: undefined;
};

export function dispatchWindowAppEvent(
  type: KeysWithoutDetail<WindowAppEventDetailMap>
): void;
export function dispatchWindowAppEvent<K extends KeysWithDetail<WindowAppEventDetailMap>>(
  type: K,
  detail: WindowAppEventDetailMap[K]
): void;
export function dispatchWindowAppEvent(
  type: keyof WindowAppEventDetailMap,
  detail?: unknown
): void {
  if (typeof window === "undefined") return;
  try {
    if (detail === undefined) {
      window.dispatchEvent(new CustomEvent(String(type)));
      return;
    }
    window.dispatchEvent(new CustomEvent(String(type), { detail }));
  } catch {
    // ignore dispatch errors
  }
}

export function addWindowAppEventListener<K extends keyof WindowAppEventDetailMap>(
  type: K,
  handler: (detail: WindowAppEventDetailMap[K]) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const wrapped: EventListener = (event: Event) => {
    handler((event as CustomEvent).detail as WindowAppEventDetailMap[K]);
  };

  window.addEventListener(String(type), wrapped);
  return () => window.removeEventListener(String(type), wrapped);
}

export function dispatchDocumentAppEvent(
  type: KeysWithoutDetail<DocumentAppEventDetailMap>
): void;
export function dispatchDocumentAppEvent<K extends KeysWithDetail<DocumentAppEventDetailMap>>(
  type: K,
  detail: DocumentAppEventDetailMap[K]
): void;
export function dispatchDocumentAppEvent(
  type: keyof DocumentAppEventDetailMap,
  detail?: unknown
): void {
  if (typeof document === "undefined") return;
  try {
    if (detail === undefined) {
      document.dispatchEvent(new CustomEvent(String(type)));
      return;
    }
    document.dispatchEvent(new CustomEvent(String(type), { detail }));
  } catch {
    // ignore dispatch errors
  }
}

export function addDocumentAppEventListener<K extends keyof DocumentAppEventDetailMap>(
  type: K,
  handler: (detail: DocumentAppEventDetailMap[K]) => void
): () => void {
  if (typeof document === "undefined") return () => {};

  const wrapped: EventListener = (event: Event) => {
    handler((event as CustomEvent).detail as DocumentAppEventDetailMap[K]);
  };

  document.addEventListener(String(type), wrapped);
  return () => document.removeEventListener(String(type), wrapped);
}
