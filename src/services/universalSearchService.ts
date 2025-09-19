/**
 * Universal Search Service
 * Searches across all app contexts: Playbook, Practice Scripts, Game Plans
 * Provides unified search results with navigation badges
 */

import type { SearchResult as PlaySearchResult } from "./playbookSearchService";
import { PlaybookSearchService } from "./playbookSearchService";
import { PracticeService } from "./practiceService";
import type { PracticeSearchResult } from "../types/practice";
import type { Play } from "../types/play";

export interface UniversalSearchResult {
  id: string;
  title: string;
  subtitle?: string;
  context: "playbook" | "practice-script" | "game-plan";
  contextLabel: string;
  contextColor: string;
  type: string;
  relevance: number;
  navigateTo: string; // URL path to navigate to
  data: unknown; // Using unknown for flexible data types
}

export interface UniversalSearchResponse {
  results: UniversalSearchResult[];
  totalCount: number;
  contextCounts: {
    playbook: number;
    "practice-script": number;
    "game-plan": number;
  };
}

export class UniversalSearchService {
  private playbookSearch: PlaybookSearchService | null = null;

  constructor(private teamId: string) {}

  /**
   * Initialize with playbook data
   */
  initializePlays(plays: Play[]): void {
    this.playbookSearch = new PlaybookSearchService(plays);
  }

  /**
   * Perform universal search across all contexts
   */
  async search(query: string): Promise<UniversalSearchResponse> {
    if (!query.trim()) {
      return {
        results: [],
        totalCount: 0,
        contextCounts: { playbook: 0, "practice-script": 0, "game-plan": 0 },
      };
    }

    const results: UniversalSearchResult[] = [];

    // Search playbook plays
    if (this.playbookSearch) {
      const playResults = this.playbookSearch.search(query);
      results.push(...this.transformPlayResults(playResults));
    }

    // Search practice content
    try {
      const practiceResults = await PracticeService.searchPractices(
        query,
        this.teamId
      );
      results.push(...this.transformPracticeResults(practiceResults));
    } catch (_error) {
      console.warn("Failed to search practice content:", _error);
    }

    // TODO: Add game plan search when GamePlanService.searchSituations is implemented
    // For now, game plans return empty results

    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);

    // Calculate context counts
    const contextCounts = results.reduce(
      (acc, result) => {
        acc[result.context]++;
        return acc;
      },
      {
        playbook: 0,
        "practice-script": 0,
        "game-plan": 0,
      } as UniversalSearchResponse["contextCounts"]
    );

    return {
      results,
      totalCount: results.length,
      contextCounts,
    };
  }

  /**
   * Get search suggestions from all contexts
   */
  async getSuggestions(query: string, limit: number = 8): Promise<string[]> {
    const suggestions = new Set<string>();

    // Playbook suggestions
    if (this.playbookSearch) {
      const playSuggestions = this.playbookSearch.getSearchSuggestions(
        query,
        limit
      );
      playSuggestions.forEach((s) => suggestions.add(s));
    }

    // Practice suggestions (could be expanded)
    try {
      // For now, just add some common practice terms
      const practiceTerms = [
        "warmup",
        "drill",
        "scrimmage",
        "break",
        "meeting",
      ];
      practiceTerms
        .filter((term) => term.toLowerCase().includes(query.toLowerCase()))
        .forEach((term) => suggestions.add(term));
    } catch (_error) {
      // Ignore practice suggestion errors
    }

    return Array.from(suggestions).slice(0, limit);
  }

  private transformPlayResults(
    playResults: PlaySearchResult<Play>[]
  ): UniversalSearchResult[] {
    return playResults.map((result) => ({
      id: `play-${result.item.id}`,
      title: result.item.play_name,
      subtitle: `${result.item.formation} • ${result.item.p_type}`,
      context: "playbook" as const,
      contextLabel: "Playbook",
      contextColor: "bg-blue-500",
      type: "Play",
      relevance: result.score || 0,
      navigateTo: `/playbook/play/${result.item.id}`,
      data: result.item,
    }));
  }

  private transformPracticeResults(
    practiceResults: PracticeSearchResult
  ): UniversalSearchResult[] {
    const results: UniversalSearchResult[] = [];

    // Transform schedules
    practiceResults.schedules.forEach((schedule: unknown) => {
      const sched = schedule as {
        id: string;
        title: string;
        blocks?: unknown[];
      };
      results.push({
        id: `schedule-${sched.id}`,
        title: sched.title,
        subtitle: `Practice Schedule • ${Array.isArray(sched.blocks) ? sched.blocks.length : 0} blocks`,
        context: "practice-script" as const,
        contextLabel: "Practice",
        contextColor: "bg-green-500",
        type: "Schedule",
        relevance: 0.8,
        navigateTo: `/practice-planner/${this.teamId}?schedule=${sched.id}`,
        data: schedule,
      });
    });

    // Transform templates
    practiceResults.templates.forEach((template: unknown) => {
      const temp = template as { id: string; name: string; blocks?: unknown[] };
      results.push({
        id: `template-${temp.id}`,
        title: temp.name,
        subtitle: `Practice Template • ${Array.isArray(temp.blocks) ? temp.blocks.length : 0} blocks`,
        context: "practice-script" as const,
        contextLabel: "Practice",
        contextColor: "bg-green-500",
        type: "Template",
        relevance: 0.7,
        navigateTo: `/practice-planner/${this.teamId}?template=${temp.id}`,
        data: template,
      });
    });

    // Transform scripts
    practiceResults.scripts.forEach((script: unknown) => {
      const scr = script as { id: string; title?: string; blocks?: unknown[] };
      results.push({
        id: `script-${scr.id}`,
        title: scr.title || "Untitled Script",
        subtitle: `Practice Script • ${Array.isArray(scr.blocks) ? scr.blocks.length : 0} blocks`,
        context: "practice-script" as const,
        contextLabel: "Practice",
        contextColor: "bg-green-500",
        type: "Script",
        relevance: 0.9,
        navigateTo: `/practice-planner/${this.teamId}?script=${scr.id}`,
        data: script,
      });
    });

    return results;
  }
}
