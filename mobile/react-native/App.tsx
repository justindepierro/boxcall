import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FlashMessage from 'react-native-flash-message';
import { StyleSheet } from 'react-native';

import { AppNavigator } from '@/navigation/AppNavigator';
import { useAppStore } from '@/store/useAppStore';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { SyncProvider } from '@/services/sync/SyncProvider';
import { OfflineProvider } from '@/services/offline/OfflineProvider';
import { NotificationProvider } from '@/services/notifications/NotificationProvider';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * BoxCall Mobile Application
 * 
 * Cross-platform mobile app providing intelligent calendar management
 * for teams with real-time synchronization and offline capabilities.
 * 
 * Features:
 * - Phase 3 Intelligence: Conflict detection, smart scheduling, analytics
 * - Cross-Platform Sync: Real-time data synchronization across all platforms
 * - Offline Support: Full functionality without internet connection
 * - Native Integration: iOS Calendar, Google Calendar, native notifications
 * - Platform Optimization: iOS and Android specific features
 */
const App: React.FC = () => {
  // Initialize app store
  const initializeApp = useAppStore((state) => state.actions.initializeApp);

  React.useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NotificationProvider>
              <OfflineProvider>
                <SyncProvider>
                  <AppNavigator />
                  <FlashMessage position="top" />
                </SyncProvider>
              </OfflineProvider>
            </NotificationProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
