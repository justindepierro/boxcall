/**
 * BoxCall Phase 4.3 Integration Example
 * Complete Mobile + React Native Platform Usage
 * 
 * This example demonstrates how to use the integrated Phase 4.2 Mobile Optimization
 * with Phase 4.3 React Native Platform for cross-platform football coaching apps
 */

import { 
  MobileOrchestrator,
  createMobileConfig,
  type MobileViewport,
  type MobileInitializationConfig
} from '../services/mobile'

import type { PlatformContext } from '../services/cross-platform/UnifiedApiGateway'

// ============================================================================
// COMPLETE MOBILE PLATFORM INITIALIZATION
// ============================================================================

/**
 * Initialize complete BoxCall mobile platform with React Native support
 */
export async function initializeBoxCallMobile(): Promise<{
  success: boolean
  appReady: boolean
  nativeReady: boolean
  error?: string
}> {
  try {
    console.log('BoxCall Mobile: Initializing Platform (Phase 4.2 + 4.3)...')

    // 1. Detect device capabilities
    const viewport: MobileViewport = {
      width: window.innerWidth || 375,
      height: window.innerHeight || 667,
      scale: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
    }

    // 2. Create platform context (this would come from your app)
    const platformContext: PlatformContext = {
      platform: 'mobile', // Will be 'mobile' for React Native app
      version: '1.0.0',
      deviceId: 'mock-device-id',
      sessionId: 'current-session-id'
    }

    // 3. Create optimal mobile configuration
    const mobileConfig: MobileInitializationConfig = createMobileConfig(viewport, platformContext)

    console.log('BoxCall Mobile: Configuration -', {
      viewport: `${viewport.width}x${viewport.height}`,
      orientation: viewport.orientation,
      performanceProfile: mobileConfig.performanceProfile,
      autoOptimization: mobileConfig.enableAutoOptimization
    })

    // 4. Initialize Phase 4.2 Mobile Optimization Foundation
    const mobileResult = await MobileOrchestrator.initializeMobileApp(mobileConfig)
    
    if (!mobileResult.success) {
      throw new Error(`Mobile initialization failed: ${mobileResult.error}`)
    }

    console.log('✅ Phase 4.2 Mobile Optimization Complete')
    console.log('BoxCall Mobile: Services Status -', {
      calendar: mobileResult.state.calendar ? 'initialized' : 'pending',
      ui: mobileResult.state.ui.theme ? 'themed' : 'default',
      performance: mobileResult.state.performance ? 'optimized' : 'standard',
      bridge: mobileResult.state.bridgeConnected ? 'connected' : 'offline'
    })

    // 5. Initialize Phase 4.3 React Native Platform
    const reactNativeResult = await MobileOrchestrator.initializeReactNativePlatform()
    
    if (!reactNativeResult.success) {
      console.warn('⚠️ React Native initialization failed:', reactNativeResult.error)
      // Continue without React Native capabilities
      return {
        success: true,
        appReady: true,
        nativeReady: false,
        error: `React Native unavailable: ${reactNativeResult.error}`
      }
    }

    console.log('✅ Phase 4.3 React Native Platform Complete')
    console.log('BoxCall Mobile: React Native Status -', {
      platform: reactNativeResult.nativeState?.platform,
      syncStatus: reactNativeResult.nativeState?.syncStatus,
      userRole: reactNativeResult.nativeState?.userRole,
      teams: reactNativeResult.nativeState?.teams.length
    })

    // 6. Enable real-time synchronization for demo teams
    const demoTeamIds = ['team-1', 'team-2'] // Replace with actual team IDs
    const syncResult = await MobileOrchestrator.enableRealTimeSync(demoTeamIds)

    if (syncResult.success) {
      console.log('BoxCall Mobile: Real-time sync enabled -', {
        subscriptions: syncResult.subscriptions.length,
        teams: demoTeamIds.length
      })
    }

    // 7. Sync cross-platform state  
    const userId = 'current-user-id' // This would come from authentication
    const syncStateResult = await MobileOrchestrator.syncCrossPlatformState(userId)
    
    if (syncStateResult.success) {
      console.log('BoxCall Mobile: Cross-platform state synchronized')
    }

    console.log('BoxCall Mobile: Platform Fully Initialized!')
    return {
      success: true,
      appReady: true,
      nativeReady: true
    }

  } catch (error) {
    console.error('❌ BoxCall Mobile Platform initialization failed:', error)
    return {
      success: false,
      appReady: false,
      nativeReady: false,
      error: `Initialization failed: ${error}`
    }
  }
}

// ============================================================================
// MOBILE PLATFORM MONITORING
// ============================================================================

/**
 * Monitor mobile platform performance and status
 */
export async function monitorMobilePlatform(): Promise<void> {
  console.log('BoxCall Mobile: Starting platform monitoring...')

  // Monitor every 30 seconds
  setInterval(async () => {
    try {
      // Get overall performance status
      const perfStatus = await MobileOrchestrator.getPerformanceStatus()
      
      // Get React Native status
      const rnStatus = MobileOrchestrator.getReactNativeStatus()
      
      // Get current app state
      const appState = MobileOrchestrator.getAppState()

      console.log('BoxCall Mobile: Platform Status -', {
        timestamp: new Date().toISOString(),
        overall: perfStatus.overall,
        mobile: {
          initialized: appState.initialized,
          bridgeConnected: appState.bridgeConnected,
          lastUpdate: appState.lastUpdate
        },
        reactNative: {
          enabled: rnStatus.enabled,
          realTimeConnected: rnStatus.realTimeConnected,
          platform: rnStatus.state?.platform
        },
        performance: {
          score: perfStatus.dashboard?.overall.score,
          battery: perfStatus.dashboard?.battery.currentLevel,
          memory: perfStatus.dashboard?.memory.usedMemory,
          frameRate: perfStatus.dashboard?.rendering.frameRate
        },
        recommendations: perfStatus.recommendations.slice(0, 3) // Top 3
      })

      // Handle performance recommendations
      if (perfStatus.recommendations.length > 0) {
        console.log('BoxCall Mobile: Performance Recommendations -', perfStatus.recommendations)
      }

    } catch (error) {
      console.error('❌ Mobile platform monitoring error:', error)
    }
  }, 30000) // Every 30 seconds
}

// ============================================================================
// MOBILE PLATFORM EVENT HANDLERS
// ============================================================================

/**
 * Handle device orientation changes
 */
export async function handleOrientationChange(): Promise<void> {
  const newViewport: MobileViewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: window.devicePixelRatio,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 }
  }

  console.log('BoxCall Mobile: Handling orientation change -', newViewport.orientation)

  const result = await MobileOrchestrator.handleViewportChange(newViewport)
  
  if (result.success) {
    console.log('✅ Viewport adapted:', result.adaptations)
  } else {
    console.error('❌ Viewport adaptation failed')
  }
}

/**
 * Handle battery level changes
 */
export async function handleBatteryChange(batteryLevel: number, isLowPowerMode: boolean = false): Promise<void> {
  console.log(`BoxCall Mobile: Battery level ${batteryLevel}% ${isLowPowerMode ? '(Low Power Mode)' : ''}`)

  const result = await MobileOrchestrator.handleBatteryChange(batteryLevel, isLowPowerMode)
  
  if (result.success && result.optimizations.length > 0) {
    console.log('⚡ Battery optimizations applied:', result.optimizations)
  }
}

/**
 * Handle memory pressure warnings
 */
export async function handleMemoryPressure(severity: 'low' | 'medium' | 'high'): Promise<void> {
  console.log(`⚠️ Memory pressure detected: ${severity}`)

  const result = await MobileOrchestrator.handleMemoryPressure(severity)
  
  if (result.success) {
    console.log(`🧹 Memory cleaned: ${result.memoryFreed}MB`, result.actions)
  }
}

// ============================================================================
// SETUP EVENT LISTENERS
// ============================================================================

/**
 * Setup all mobile platform event listeners
 */
export function setupMobilePlatformListeners(): void {
  // Orientation change
  window.addEventListener('orientationchange', handleOrientationChange)
  window.addEventListener('resize', handleOrientationChange)

  // Battery API (if supported)
  if ('getBattery' in navigator) {
    interface BatteryManager {
      level: number
      lowPowerMode?: boolean
      addEventListener: (event: string, callback: () => void) => void
    }

    const navigatorWithBattery = navigator as Navigator & {
      getBattery(): Promise<BatteryManager>
    }

    navigatorWithBattery.getBattery().then((battery: BatteryManager) => {
      const handleBatteryUpdate = () => {
        handleBatteryChange(battery.level * 100, battery.lowPowerMode || false)
      }

      battery.addEventListener('levelchange', handleBatteryUpdate)
      battery.addEventListener('chargingchange', handleBatteryUpdate)
      
      // Initial battery status
      handleBatteryUpdate()
    })
  }

  // Memory pressure (if supported)
  if ('memory' in performance) {
    interface MemoryInfo {
      usedJSHeapSize: number
      jsHeapSizeLimit: number
    }

    setInterval(() => {
      const memInfo = (performance as Performance & { memory: MemoryInfo }).memory
      if (memInfo) {
        const usedRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit
        
        if (usedRatio > 0.9) {
          handleMemoryPressure('high')
        } else if (usedRatio > 0.7) {
          handleMemoryPressure('medium')
        } else if (usedRatio > 0.5) {
          handleMemoryPressure('low')
        }
      }
    }, 10000) // Check every 10 seconds
  }

  // Page visibility for background optimization
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('BoxCall Mobile: App backgrounded - enabling background optimizations')
      // Could trigger background optimization mode
    } else {
      console.log('BoxCall Mobile: App foregrounded - resuming full performance')
      // Could restore full performance mode
    }
  })

  console.log('BoxCall Mobile: Event listeners active')
}

// ============================================================================
// INITIALIZATION HELPER
// ============================================================================

/**
 * Complete BoxCall mobile platform setup
 * Call this once when your app starts
 */
export async function setupBoxCallMobile(): Promise<void> {
  console.log('BoxCall Mobile: Setting up Platform...')

  // 1. Initialize platform
  const initResult = await initializeBoxCallMobile()
  
  if (!initResult.success) {
    throw new Error(`Mobile platform setup failed: ${initResult.error}`)
  }

  // 2. Setup event listeners
  setupMobilePlatformListeners()

  // 3. Start monitoring
  await monitorMobilePlatform()

  console.log('BoxCall Mobile: Platform ready for coaching!')
  console.log('BoxCall Mobile: Features available -', {
    mobileOptimization: initResult.appReady,
    reactNative: initResult.nativeReady,
    realTimeSync: initResult.nativeReady,
    crossPlatform: initResult.nativeReady,
    performanceMonitoring: true,
    batteryOptimization: true,
    memoryManagement: true
  })
}

// ============================================================================
// EXPORT FOR APP INTEGRATION
// ============================================================================

export default {
  initialize: initializeBoxCallMobile,
  setup: setupBoxCallMobile,
  monitor: monitorMobilePlatform,
  handlers: {
    orientation: handleOrientationChange,
    battery: handleBatteryChange,
    memory: handleMemoryPressure
  }
}
