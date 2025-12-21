import type { Database, Tables, Updates } from "../../types/database";
import type { PostgrestError } from "@supabase/supabase-js";

import { supabase } from "../../lib/supabase";

export type DbOk<T> = { data: T; error: null };
export type DbErr = { data: null; error: PostgrestError };
export type DbResult<T> = DbOk<T> | DbErr;

export type TableName = keyof Database["public"]["Tables"];

export function table<T extends TableName>(tableName: T) {
  return supabase.from(tableName);
}

export function fromAny(tableName: string) {
  // Used for views or tables not represented in generated `Database` types.
  return (supabase as any).from(tableName);
}

export async function updateById<T extends TableName>(
  tableName: T,
  id: string,
  updates: Updates<T>
): Promise<DbResult<Tables<T>>> {
  const { data, error } = await (table(tableName) as any)
    .update(updates as any)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { data: null, error };
  return { data: data as Tables<T>, error: null };
}
