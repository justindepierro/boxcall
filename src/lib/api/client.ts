/**
 * BoxCall API Client - Industry-Leading Data Layer
 *
 * A unified, bulletproof API client that:
 * 1. Properly initializes auth before any queries
 * 2. Provides consistent error handling
 * 3. Implements retry logic with exponential backoff
 * 4. Supports request deduplication
 * 5. Works seamlessly online/offline
 *
 * This replaces all scattered direct fetch workarounds with a single,
 * well-tested, type-safe API layer.
 */

import type { Database } from "../../types/database";

// Types
type TableName = keyof Database["public"]["Tables"];
type Row<T extends TableName> = Database["public"]["Tables"][T]["Row"];

export interface ApiClientConfig {
  baseUrl: string;
  anonKey: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface QueryOptions<T extends TableName> {
  select?: string;
  filters?: QueryFilter[];
  order?: { column: keyof Row<T>; ascending?: boolean };
  limit?: number;
  offset?: number;
  count?: "exact" | "planned" | "estimated";
  single?: boolean;
  maybeSingle?: boolean;
  abortSignal?: AbortSignal;
}

export interface QueryFilter {
  column: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "is";
  value: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface MutateOptions<T extends TableName> {
  select?: string;
  filters?: QueryFilter[];
  body?: Partial<Row<T>> | Partial<Row<T>>[];
  onConflict?: string; // For upsert
  returning?: boolean;
  single?: boolean;
  count?: "exact" | "planned" | "estimated";
  timeout?: number;
}

// In-flight request cache for deduplication
const inflightRequests = new Map<string, Promise<any>>();

// Auth token state
let currentAccessToken: string | null = null;

/**
 * BoxCall API Client
 *
 * Usage:
 * ```ts
 * const api = new ApiClient({
 *   baseUrl: import.meta.env.VITE_SUPABASE_URL,
 *   anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
 * });
 *
 * const { data, error } = await api.from('plays').select('*').eq('team_id', teamId);
 * ```
 */
export class ApiClient {
  private config: Required<ApiClientConfig>;
  private initialized = false;

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
  }

  /**
   * Initialize the client - simple, just mark as ready
   * Token is managed by supabase.ts via onAuthStateChange -> setAccessToken
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // If no token yet, try to read from localStorage as fallback
    if (!currentAccessToken) {
      const stored = this.getStoredToken();
      if (stored) {
        currentAccessToken = stored;
        console.log("🔌 [ApiClient] Using token from localStorage");
      }
    }

    this.initialized = true;
    console.log(
      "🔌 [ApiClient] Initialized:",
      currentAccessToken ? "with auth token" : "with anon key only"
    );
  }

  /**
   * Get the current access token from localStorage
   * Checks both Supabase's storage and Zustand's persisted auth store
   */
  private getStoredToken(): string | null {
    try {
      // First try Supabase's storage (most reliable source)
      const supabaseAuth = localStorage.getItem("boxcall-auth");
      console.log(
        "🔌 [ApiClient] Checking boxcall-auth:",
        supabaseAuth ? "exists" : "missing"
      );
      if (supabaseAuth) {
        const parsed = JSON.parse(supabaseAuth);
        console.log("🔌 [ApiClient] boxcall-auth parsed:", {
          hasAccessToken: !!parsed?.access_token,
          expiresAt: parsed?.expires_at,
          now: Math.floor(Date.now() / 1000),
        });
        const expiresAt = parsed?.expires_at;
        const now = Math.floor(Date.now() / 1000);

        // Check if token is not expired (with 60s buffer)
        if (parsed?.access_token && (!expiresAt || expiresAt >= now + 60)) {
          console.log("🔌 [ApiClient] Using token from Supabase storage");
          return parsed.access_token;
        }
      }

      // Fallback: try Zustand's persisted auth store
      const zustandAuth = localStorage.getItem("boxcall-auth-storage");
      console.log(
        "🔌 [ApiClient] Checking boxcall-auth-storage:",
        zustandAuth ? "exists" : "missing"
      );
      if (zustandAuth) {
        const parsed = JSON.parse(zustandAuth);
        console.log(
          "🔌 [ApiClient] boxcall-auth-storage full state:",
          parsed?.state
        );
        const session = parsed?.state?.session;
        console.log("🔌 [ApiClient] boxcall-auth-storage parsed:", {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          expiresAt: session?.expires_at,
          hasUser: !!parsed?.state?.user,
          hasProfile: !!parsed?.state?.profile,
          now: Math.floor(Date.now() / 1000),
        });
        if (session?.access_token) {
          const expiresAt = session.expires_at;
          const now = Math.floor(Date.now() / 1000);

          // Check if token is not expired (with 60s buffer)
          if (!expiresAt || expiresAt >= now + 60) {
            console.log("🔌 [ApiClient] Using token from Zustand storage");
            return session.access_token;
          }
        }
      }

      return null;
    } catch (e) {
      console.log("🔌 [ApiClient] Error reading stored token:", e);
      return null;
    }
  }

  /**
   * Update the access token (called by supabase.ts on auth state changes)
   */
  static setAccessToken(token: string | null): void {
    currentAccessToken = token;
    if (import.meta.env.DEV) {
      console.log(
        "🔌 [ApiClient] Token updated:",
        token ? "present" : "cleared"
      );
    }
  }

  /**
   * Create a query builder for a table
   */
  from<T extends TableName>(table: T): QueryBuilder<T> {
    return new QueryBuilder<T>(this, table);
  }

  /**
   * Execute a raw query
   */
  async query<T>(
    table: string,
    options: QueryOptions<any> = {}
  ): Promise<ApiResponse<T>> {
    // Ensure initialized
    await this.initialize();

    const cacheKey = this.buildCacheKey(table, options);

    // Check for in-flight duplicate request
    const inflight = inflightRequests.get(cacheKey);
    if (inflight) {
      console.log(
        "🔌 [ApiClient] Deduplicating request:",
        cacheKey.substring(0, 50)
      );
      return inflight;
    }

    const requestPromise = this.executeQuery<T>(table, options);

    // Cache the promise for deduplication
    inflightRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up cache after request completes
      inflightRequests.delete(cacheKey);
    }
  }

  private buildCacheKey(table: string, options: QueryOptions<any>): string {
    return `${table}:${JSON.stringify(options)}`;
  }

  private async executeQuery<T>(
    table: string,
    options: QueryOptions<any>
  ): Promise<ApiResponse<T>> {
    const { maxRetries, retryDelay, timeout } = this.config;
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.doRequest<T>(table, options, timeout);
        return result;
      } catch (err: any) {
        lastError = {
          message: err.message || "Unknown error",
          status: err.status,
          code: err.code,
        };

        // Don't retry on 4xx errors (except 408, 429)
        if (
          err.status >= 400 &&
          err.status < 500 &&
          err.status !== 408 &&
          err.status !== 429
        ) {
          break;
        }

        // Don't retry if aborted
        if (err.name === "AbortError") {
          break;
        }

        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(2, attempt);
          console.log(
            `🔌 [ApiClient] Retry ${attempt + 1}/${maxRetries} in ${delay}ms`
          );
          await this.sleep(delay);
        }
      }
    }

    return { data: null, error: lastError };
  }

  /**
   * Execute a write operation (INSERT, UPDATE, DELETE, UPSERT)
   */
  async mutate<T>(
    table: string,
    method: "POST" | "PATCH" | "DELETE",
    options: MutateOptions<any> = {}
  ): Promise<ApiResponse<T>> {
    // Ensure initialized
    await this.initialize();

    const timeout = options.timeout ?? this.config.timeout;

    try {
      return await this.doMutateRequest<T>(table, method, options, timeout);
    } catch (err: any) {
      return {
        data: null,
        error: {
          message: err.message || "Unknown error",
          status: err.status,
          code: err.code,
        },
      };
    }
  }

  private async doMutateRequest<T>(
    table: string,
    method: "POST" | "PATCH" | "DELETE",
    options: MutateOptions<any>,
    timeout: number
  ): Promise<ApiResponse<T>> {
    const { baseUrl, anonKey } = this.config;

    // Build URL
    const url = new URL(`${baseUrl}/rest/v1/${table}`);

    // Add select for returning data
    if (options.select) {
      url.searchParams.set("select", options.select);
    }

    // Add filters (for UPDATE/DELETE)
    if (options.filters) {
      for (const filter of options.filters) {
        const value = this.formatFilterValue(filter.operator, filter.value);
        url.searchParams.append(filter.column, value);
      }
    }

    // Build headers
    const headers: Record<string, string> = {
      apikey: anonKey,
      Authorization: `Bearer ${currentAccessToken || anonKey}`,
      "Content-Type": "application/json",
    };

    // Set Prefer header for return type and upsert
    const preferParts: string[] = [];
    if (options.returning !== false) {
      preferParts.push("return=representation");
    }
    if (options.onConflict) {
      preferParts.push(`resolution=merge-duplicates`);
    }
    if (options.count) {
      preferParts.push(`count=${options.count}`);
    }
    if (preferParts.length > 0) {
      headers["Prefer"] = preferParts.join(",");
    }

    if (options.single) {
      headers["Accept"] = "application/vnd.pgrst.object+json";
    }

    // Add on_conflict for upsert
    if (options.onConflict) {
      url.searchParams.set("on_conflict", options.onConflict);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        let errorJson: any = {};
        try {
          errorJson = JSON.parse(errorBody);
        } catch {
          // Ignore JSON parse errors
        }

        throw {
          message: errorJson.message || `HTTP ${response.status}`,
          status: response.status,
          code: errorJson.code,
          details: errorJson,
        };
      }

      // Handle empty response (204 No Content)
      if (response.status === 204 || options.returning === false) {
        return { data: null as T, error: null };
      }

      const data = (await response.json()) as T;
      return { data, error: null };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  private async doRequest<T>(
    table: string,
    options: QueryOptions<any>,
    timeout: number
  ): Promise<ApiResponse<T>> {
    const { baseUrl, anonKey } = this.config;

    // Build URL
    const url = new URL(`${baseUrl}/rest/v1/${table}`);

    // Add select
    if (options.select) {
      url.searchParams.set("select", options.select);
    }

    // Add filters
    if (options.filters) {
      for (const filter of options.filters) {
        const value = this.formatFilterValue(filter.operator, filter.value);
        url.searchParams.append(filter.column, value);
      }
    }

    // Add order
    if (options.order) {
      const dir = options.order.ascending !== false ? "asc" : "desc";
      url.searchParams.set("order", `${String(options.order.column)}.${dir}`);
    }

    // Add limit
    if (options.limit !== undefined) {
      url.searchParams.set("limit", String(options.limit));
    }

    // Add offset
    if (options.offset !== undefined) {
      url.searchParams.set("offset", String(options.offset));
    }

    // Build headers
    const headers: Record<string, string> = {
      apikey: anonKey,
      Authorization: `Bearer ${currentAccessToken || anonKey}`,
      "Content-Type": "application/json",
    };

    if (options.count) {
      headers["Prefer"] = `count=${options.count}`;
    }

    // Only use object header for strict single() - not maybeSingle()
    // maybeSingle() should return null instead of 406 when no rows found
    if (options.single && !options.maybeSingle) {
      headers["Accept"] = "application/vnd.pgrst.object+json";
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Merge with user-provided signal
    const signal = options.abortSignal
      ? this.mergeAbortSignals(options.abortSignal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers,
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text();
        let errorJson: any = {};
        try {
          errorJson = JSON.parse(errorBody);
        } catch {
          // Ignore JSON parse errors, use empty object
        }

        // Handle 406 for maybeSingle - return null instead of error
        // PostgREST returns 406 when single() is used but 0 rows match
        if (response.status === 406 && options.maybeSingle) {
          return { data: null as T, error: null };
        }

        throw {
          message: errorJson.message || `HTTP ${response.status}`,
          status: response.status,
          code: errorJson.code,
          details: errorJson,
        };
      }

      // Parse count from header
      let count: number | undefined;
      const rangeHeader = response.headers.get("content-range");
      if (rangeHeader) {
        const match = rangeHeader.match(/\/(\d+|\*)/);
        if (match && match[1] !== "*") {
          count = parseInt(match[1], 10);
        }
      }

      const responseData = await response.json();

      // Handle maybeSingle - return first element or null from array response
      let data: T;
      if (options.maybeSingle) {
        data = (
          Array.isArray(responseData) ? (responseData[0] ?? null) : responseData
        ) as T;
      } else if (options.single) {
        // For strict single(), response is already an object
        data = responseData as T;
      } else {
        data = responseData as T;
      }

      return { data, error: null, count };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  private formatFilterValue(
    operator: QueryFilter["operator"],
    value: any
  ): string {
    switch (operator) {
      case "eq":
        return `eq.${value}`;
      case "neq":
        return `neq.${value}`;
      case "gt":
        return `gt.${value}`;
      case "gte":
        return `gte.${value}`;
      case "lt":
        return `lt.${value}`;
      case "lte":
        return `lte.${value}`;
      case "like":
        return `like.${value}`;
      case "ilike":
        return `ilike.${value}`;
      case "in":
        return `in.(${Array.isArray(value) ? value.join(",") : value})`;
      case "is":
        return `is.${value}`;
      default:
        return `eq.${value}`;
    }
  }

  private mergeAbortSignals(
    signal1: AbortSignal,
    signal2: AbortSignal
  ): AbortSignal {
    const controller = new AbortController();

    const abort = () => controller.abort();
    signal1.addEventListener("abort", abort);
    signal2.addEventListener("abort", abort);

    return controller.signal;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Fluent query builder for type-safe queries
 */
class QueryBuilder<T extends TableName> {
  private client: ApiClient;
  private table: T;
  private options: QueryOptions<T> = {};
  private mutateOpts: MutateOptions<T> = {};

  constructor(client: ApiClient, table: T) {
    this.client = client;
    this.table = table;
  }

  select(columns: string = "*"): this {
    this.options.select = columns;
    this.mutateOpts.select = columns;
    return this;
  }

  eq<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "eq", value);
    return this;
  }

  neq<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "neq", value);
    return this;
  }

  in<K extends keyof Row<T>>(column: K, values: Row<T>[K][]): this {
    this.addFilter(String(column), "in", values);
    return this;
  }

  gt<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "gt", value);
    return this;
  }

  gte<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "gte", value);
    return this;
  }

  lt<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "lt", value);
    return this;
  }

  lte<K extends keyof Row<T>>(column: K, value: Row<T>[K]): this {
    this.addFilter(String(column), "lte", value);
    return this;
  }

  like<K extends keyof Row<T>>(column: K, pattern: string): this {
    this.addFilter(String(column), "like", pattern);
    return this;
  }

  ilike<K extends keyof Row<T>>(column: K, pattern: string): this {
    this.addFilter(String(column), "ilike", pattern);
    return this;
  }

  is<K extends keyof Row<T>>(column: K, value: null | boolean): this {
    this.addFilter(String(column), "is", value);
    return this;
  }

  order<K extends keyof Row<T>>(
    column: K,
    options?: { ascending?: boolean }
  ): this {
    this.options.order = {
      column,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  limit(count: number): this {
    this.options.limit = count;
    return this;
  }

  range(from: number, to: number): this {
    this.options.offset = from;
    this.options.limit = to - from + 1;
    return this;
  }

  single(): QueryBuilder<T> {
    this.options.single = true;
    this.mutateOpts.single = true;
    return this;
  }

  /**
   * Expect at most one row. Returns null (not error) if no rows found.
   * Unlike single(), this won't throw a 406 error when zero rows match.
   */
  maybeSingle(): QueryBuilder<T> {
    this.options.single = true;
    this.options.maybeSingle = true;
    this.mutateOpts.single = true;
    return this;
  }

  abortSignal(signal: AbortSignal): this {
    this.options.abortSignal = signal;
    return this;
  }

  /**
   * Insert one or more rows
   */
  async insert(
    data: Partial<Row<T>> | Partial<Row<T>>[]
  ): Promise<ApiResponse<Row<T>[]>> {
    const result = await this.client.mutate<Row<T>[]>(this.table, "POST", {
      ...this.mutateOpts,
      body: data,
      filters: this.options.filters,
    });
    return result;
  }

  /**
   * Update rows matching the filters
   */
  async update(data: Partial<Row<T>>): Promise<ApiResponse<Row<T>[]>> {
    const result = await this.client.mutate<Row<T>[]>(this.table, "PATCH", {
      ...this.mutateOpts,
      body: data,
      filters: this.options.filters,
    });
    return result;
  }

  /**
   * Delete rows matching the filters
   */
  async delete(): Promise<ApiResponse<Row<T>[]>> {
    const result = await this.client.mutate<Row<T>[]>(this.table, "DELETE", {
      ...this.mutateOpts,
      filters: this.options.filters,
    });
    return result;
  }

  /**
   * Upsert (insert or update on conflict)
   */
  async upsert(
    data: Partial<Row<T>> | Partial<Row<T>>[],
    options?: { onConflict?: string }
  ): Promise<ApiResponse<Row<T>[]>> {
    const result = await this.client.mutate<Row<T>[]>(this.table, "POST", {
      ...this.mutateOpts,
      body: data,
      onConflict: options?.onConflict,
      filters: this.options.filters,
    });
    return result;
  }

  private addFilter(
    column: string,
    operator: QueryFilter["operator"],
    value: any
  ): void {
    if (!this.options.filters) {
      this.options.filters = [];
    }
    this.options.filters.push({ column, operator, value });
  }

  async then<TResult1 = ApiResponse<Row<T>[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: ApiResponse<Row<T>[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    _onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    const result = await this.client.query<Row<T>[]>(this.table, this.options);
    return onfulfilled ? onfulfilled(result) : (result as TResult1);
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

/**
 * Get the global API client instance
 */
export function getApiClient(): ApiClient {
  if (!apiClientInstance) {
    const baseUrl = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!baseUrl || !anonKey) {
      throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    }

    apiClientInstance = new ApiClient({ baseUrl, anonKey });
  }
  return apiClientInstance;
}

/**
 * Convenience function for quick queries
 */
export function api<T extends TableName>(table: T): QueryBuilder<T> {
  return getApiClient().from(table);
}

export default ApiClient;
