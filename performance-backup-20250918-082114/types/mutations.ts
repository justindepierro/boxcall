// Minimal mutation contract compatible with TanStack Query v5
export type MinimalMutation<Args = unknown, Result = unknown> = {
  status: "idle" | "pending" | "success" | "error" | string;
  mutate: (...args: Args[]) => void;
  mutateAsync: (...args: Args[]) => Promise<Result>;
};
