/**
 * Smart Preloading Service
 *
 * Intelligently preloads components and resources based on user behavior patterns
 * and contextual predictions to improve perceived performance.
 */

interface PreloadableResource {
  id: string;
  loader: () => Promise<any>;
  priority: "high" | "medium" | "low";
  size: number; // Estimated size in KB
  context: string[]; // Contexts where this should be preloaded
}

interface UserAction {
  type: string;
  context: string;
  timestamp: number;
}

export class SmartPreloader {
  private static instance: SmartPreloader;
  private preloadedResources = new Set<string>();
  private userActions: UserAction[] = [];
  private preloadQueue: PreloadableResource[] = [];
  private isPreloading = false;
  private readonly MAX_CONCURRENT_PRELOADS = 2;
  private readonly ACTION_HISTORY_SIZE = 10;

  private constructor() {
    this.initializePreloadableResources();
    this.startBehavioralAnalysis();
  }

  static getInstance(): SmartPreloader {
    if (!SmartPreloader.instance) {
      SmartPreloader.instance = new SmartPreloader();
    }
    return SmartPreloader.instance;
  }

  /**
   * Record a user action for behavioral analysis
   */
  recordAction(type: string, context: string): void {
    this.userActions.push({
      type,
      context,
      timestamp: Date.now(),
    });

    // Keep only recent actions
    if (this.userActions.length > this.ACTION_HISTORY_SIZE) {
      this.userActions = this.userActions.slice(-this.ACTION_HISTORY_SIZE);
    }

    // Trigger predictive preloading
    this.predictAndPreload();
  }

  /**
   * Check if a resource is already preloaded
   */
  isPreloaded(resourceId: string): boolean {
    return this.preloadedResources.has(resourceId);
  }

  /**
   * Manually preload a specific resource
   */
  async preloadResource(resourceId: string): Promise<void> {
    const resource = this.preloadQueue.find((r) => r.id === resourceId);
    if (!resource || this.preloadedResources.has(resourceId)) {
      return;
    }

    try {
      await resource.loader();
      this.preloadedResources.add(resourceId);
    } catch (error) {
      console.warn(`Failed to preload resource ${resourceId}:`, error);
    }
  }

  /**
   * Preload resources for a specific context
   */
  async preloadForContext(context: string): Promise<void> {
    const relevantResources = this.preloadQueue.filter(
      (r) => r.context.includes(context) && !this.preloadedResources.has(r.id)
    );

    // Sort by priority
    relevantResources.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    // Preload high priority resources first
    const highPriority = relevantResources.filter((r) => r.priority === "high");
    const mediumPriority = relevantResources.filter(
      (r) => r.priority === "medium"
    );

    await this.preloadBatch(highPriority);
    await this.preloadBatch(mediumPriority);
  }

  /**
   * Analyze user behavior and predict what to preload
   */
  private predictAndPreload(): void {
    const recentActions = this.userActions.slice(-5);

    // Predict based on action patterns
    const predictions = this.analyzePatterns(recentActions);

    for (const prediction of predictions) {
      this.preloadForContext(prediction.context);
    }
  }

  /**
   * Analyze user action patterns to predict next actions
   */
  private analyzePatterns(
    actions: UserAction[]
  ): Array<{ context: string; confidence: number }> {
    const predictions: Array<{ context: string; confidence: number }> = [];

    // Pattern: User opened playbook → likely to create/edit plays
    if (actions.some((a) => a.type === "view_playbook")) {
      predictions.push({ context: "playbook_editing", confidence: 0.8 });
    }

    // Pattern: User viewed analytics → likely to continue analyzing
    if (actions.some((a) => a.type === "view_analytics")) {
      predictions.push({ context: "analytics_deep_dive", confidence: 0.7 });
    }

    // Pattern: User created a play → likely to create more
    if (actions.some((a) => a.type === "create_play")) {
      predictions.push({ context: "formation_builder", confidence: 0.9 });
    }

    // Pattern: User viewed team bulletin → likely to engage socially
    if (actions.some((a) => a.type === "view_bulletin")) {
      predictions.push({ context: "social_interaction", confidence: 0.6 });
    }

    return predictions.filter((p) => p.confidence > 0.5);
  }

  /**
   * Preload a batch of resources with concurrency control
   */
  private async preloadBatch(resources: PreloadableResource[]): Promise<void> {
    if (this.isPreloading || resources.length === 0) return;

    this.isPreloading = true;

    try {
      // Process in batches to avoid overwhelming the network
      for (let i = 0; i < resources.length; i += this.MAX_CONCURRENT_PRELOADS) {
        const batch = resources.slice(i, i + this.MAX_CONCURRENT_PRELOADS);
        await Promise.allSettled(
          batch.map((resource) => this.preloadResource(resource.id))
        );

        // Small delay between batches
        if (i + this.MAX_CONCURRENT_PRELOADS < resources.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Initialize the list of preloadable resources
   */
  private initializePreloadableResources(): void {
    this.preloadQueue = [
      {
        id: "game-plan-modal",
        loader: () => import("../components/playbook/GamePlanModal"),
        priority: "medium",
        size: 80,
        context: ["game_planning"],
      },
      {
        id: "practice-script-modal",
        loader: () => import("../components/practice/PracticeScriptModal"),
        priority: "low",
        size: 40,
        context: ["practice_planning"],
      },
    ];
  }

  /**
   * Start behavioral analysis timer
   */
  private startBehavioralAnalysis(): void {
    // Analyze patterns every 30 seconds
    setInterval(() => {
      this.predictAndPreload();
    }, 30000);
  }

  /**
   * Get preloading statistics for debugging
   */
  getStats(): {
    preloadedCount: number;
    queueLength: number;
    recentActions: UserAction[];
  } {
    return {
      preloadedCount: this.preloadedResources.size,
      queueLength: this.preloadQueue.length,
      recentActions: [...this.userActions],
    };
  }
}

// Export singleton instance
export const smartPreloader = SmartPreloader.getInstance();
