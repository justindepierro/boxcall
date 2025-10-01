/**
 * Temporary Auth Debug Component
 * Add this to PlaybookPage to see auth state
 */

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AuthDebugPanel() {
  const [authState, setAuthState] = useState<{
    hasSession: boolean;
    userId: string | null;
    error: string | null;
  }>({
    hasSession: false,
    userId: null,
    error: null,
  });

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        setAuthState({
          hasSession: !!session,
          userId: session?.user?.id || null,
          error: error?.message || null,
        });

        console.log('🔐 AUTH DEBUG:', {
          session: !!session,
          userId: session?.user?.id,
          accessToken: session?.access_token ? 'PRESENT' : 'MISSING',
          expiresAt: session?.expires_at,
          error,
        });
      } catch (err) {
        setAuthState({
          hasSession: false,
          userId: null,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    checkAuth();
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      padding: '12px',
      background: authState.hasSession ? '#10b981' : '#ef4444',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        🔐 Auth Status
      </div>
      <div>Session: {authState.hasSession ? '✅ ACTIVE' : '❌ NONE'}</div>
      <div>User ID: {authState.userId || 'NULL'}</div>
      {authState.error && <div style={{ marginTop: '4px', fontSize: '10px' }}>Error: {authState.error}</div>}
    </div>
  );
}
