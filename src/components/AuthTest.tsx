import React from 'react';
import { Button } from '../components/ui';
import { useAuth, useAuthLoading, useAuthError, useIsAuthenticated } from '../app/auth-store';

/**
 * AuthTest Component
 * 
 * Simple component to test our authentication store
 * Tests all major auth operations without requiring UI forms
 */
export const AuthTest: React.FC = () => {
  const { signIn, signUp, signOut, clearError } = useAuth();
  const loading = useAuthLoading();
  const error = useAuthError();
  const isAuthenticated = useIsAuthenticated();

  const handleTestSignUp = async () => {
    const result = await signUp('test@example.com', 'password123', {
      firstName: 'Test',
      lastName: 'User',
      role: 'coach'
    });
    
    console.log('SignUp result:', result);
  };

  const handleTestSignIn = async () => {
    const result = await signIn('test@example.com', 'password123');
    console.log('SignIn result:', result);
  };

  const handleTestSignOut = async () => {
    await signOut();
    console.log('SignOut completed');
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        🔐 Auth Store Test
      </h2>
      
      <div className="space-y-3">
        <div className="text-sm">
          <strong>Status:</strong>{' '}
          <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
            {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
          </span>
        </div>
        
        {loading && (
          <div className="text-blue-600">
            ⏳ Loading...
          </div>
        )}
        
        {error && (
          <div className="text-red-600 text-sm">
            <div>❌ Error: {error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="mt-1"
            >
              Clear Error
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          <Button
            variant="primary"
            onClick={handleTestSignUp}
            disabled={loading}
            fullWidth
          >
            Test Sign Up
          </Button>
          
          <Button
            variant="secondary"
            onClick={handleTestSignIn}
            disabled={loading}
            fullWidth
          >
            Test Sign In
          </Button>
          
          <Button
            variant="outline"
            onClick={handleTestSignOut}
            disabled={loading}
            fullWidth
          >
            Test Sign Out
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          💡 Check the browser console for detailed logs
        </div>
      </div>
    </div>
  );
};
