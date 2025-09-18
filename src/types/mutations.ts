// Minimal mutation contract compatible with TanStack Query v5
export type MinimalMutation<
  TVariables = void,
  TError = Error,
  TData = unknown,
  TContext = unknown,
> = {
  status: "idle" | "pending" | "success" | "error";
  mutate: (
    variables: TVariables,
    options?: {
      onSuccess?: (
        data: TData,
        variables: TVariables,
        context: TContext
      ) => void;
      onError?: (
        error: TError,
        variables: TVariables,
        context: TContext | undefined
      ) => void;
      onSettled?: (
        data: TData | undefined,
        error: TError | null,
        variables: TVariables,
        context: TContext | undefined
      ) => void;
    }
  ) => void;
  mutateAsync: (
    variables: TVariables,
    options?: {
      onSuccess?: (
        data: TData,
        variables: TVariables,
        context: TContext
      ) => void;
      onError?: (
        error: TError,
        variables: TVariables,
        context: TContext | undefined
      ) => void;
      onSettled?: (
        data: TData | undefined,
        error: TError | null,
        variables: TVariables,
        context: TContext | undefined
      ) => void;
    }
  ) => Promise<TData>;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: TError | null;
  data: TData | undefined;
};
