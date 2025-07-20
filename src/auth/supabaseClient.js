// src/auth/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

import { checkEnv } from '../auth/envChecker.js';

const { VITE_SUPABASE_URL: supabaseUrl, VITE_SUPABASE_ANON_KEY: supabaseAnonKey } = checkEnv([
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      Accept: 'application/json',
    },
  },
});
