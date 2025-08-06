/**
 * Core Database Types
 * Base types for BoxCall database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
