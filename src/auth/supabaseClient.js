// src/auth/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Pull from environment variables (must be set in .env file or system vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
  throw new Error('Missing Supabase credentials in environment variables.');
}

// Create the Supabase client (safe for SSR / SPA)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
