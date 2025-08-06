/**
 * React Native Platform Integration Service
 * 
 * Handles React Native platform initialization and real-time synchronization.
 * 
 * @author BoxCall Development Team
 * @version 2.0.0
 */

import ReactNativePlatformService from "../../react-native/ReactNativePlatformService";
import { MobileStateManager } from "./MobileStateManager";
import type { 
  ReactNativeInitializationResult,
  RealTimeSyncResult
} from "./types";

/**
 * Service for React Native platform integration
 */
export class ReactNativeIntegrationService {
  /**
   * Initialize React Native platform with cross-platform capabilities
   */
  static async initializeReactNativePlatform(): Promise<ReactNativeInitializationResult> {
    try {
      if (!MobileStateManager.isInitialized()) {
        throw new Error("Mobile app must be initialized first");
      }

      // Initialize React Native platform service
      const rnPlatformService = new ReactNativePlatformService();
      const nativeState = await rnPlatformService.initializeNativeApp();

      // Update app state with React Native integration
      MobileStateManager.updateReactNativeState(true, nativeState, nativeState.syncStatus === "connected");

      return {
        success: true,
        nativeState,
      };
    } catch (error) {
      return {
        success: false,
        nativeState: null,
        error: `React Native initialization failed: ${error}`,
      };
    }
  }

  /**
   * Enable real-time synchronization for cross-platform features
   */
  static async enableRealTimeSync(teamIds: string[]): Promise<RealTimeSyncResult> {
    try {
      const currentState = MobileStateManager.getAppState();
      
      if (
        !currentState.reactNative.enabled ||
        !currentState.reactNative.state
      ) {
        throw new Error("React Native platform must be initialized first");
      }

      const rnPlatformService = new ReactNativePlatformService();
      const realTimeService = rnPlatformService.getRealTimeService();
      const subscriptions: string[] = [];

      // Subscribe to calendar changes for each team
      for (const teamId of teamIds) {
        const calendarSub = await realTimeService.subscribeToCalendarChanges(
          teamId,
          (events) => {
            console.log(`Calendar updated for team ${teamId}:`, events);
            // Update mobile calendar state
            // The state manager will automatically update lastUpdate timestamp
          }
        );
        subscriptions.push(calendarSub);

        const teamSub = await realTimeService.subscribeToTeamUpdates(
          teamId,
          (update) => {
            console.log(`Team update for ${teamId}:`, update);
            // Handle team updates
          }
        );
        subscriptions.push(teamSub);
      }

      // Update real-time connection status
      MobileStateManager.updateRealTimeConnection(true);

      return {
        success: true,
        subscriptions,
      };
    } catch (error) {
      return {
        success: false,
        subscriptions: [],
        error: `Real-time sync initialization failed: ${error}`,
      };
    }
  }
}
