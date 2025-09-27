import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { usePlaySearch } from "./usePlaySearch";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

// Mock telemetry to prevent actual telemetry calls in stories
jest.mock("../telemetry/dispatcher", () => ({
  telemetry: {
    enqueue: jest.fn(),
  },
}));

// Mock supabase to return controlled data
jest.mock("../lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const { supabase } = require("../lib/supabase");

const meta: Meta = {
  title: "Hooks/usePlaySearch",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
A powerful search hook for finding plays in playbooks with intelligent full-text and fuzzy search capabilities.

**Features:**
- Debounced search with configurable delay
- Full-text search with ranking
- Automatic fallback to fuzzy search when no results
- Telemetry tracking for search analytics
- Configurable minimum character limits
- Playbook-specific filtering

**Usage:**
\`\`\`tsx
const { results, loading, query, setQuery, select, attemptedFuzzy, error } = usePlaySearch(
  initialQuery,
  {
    playbookId: "playbook-123",
    debounceMs: 200,
    minChars: 2,
    limit: 12
  }
);
\`\`\`
        `,
      },
    },
  },
};

export default meta;

// Mock data for stories
const mockFulltextResults = [
  { play_id: "play-1", rank: 0.9, source: "fulltext" as const },
  { play_id: "play-2", rank: 0.8, source: "fulltext" as const },
  { play_id: "play-3", rank: 0.7, source: "fulltext" as const },
];

const mockFuzzyResults = [
  { play_id: "play-4", similarity: 0.6, source: "fuzzy" as const },
  { play_id: "play-5", similarity: 0.5, source: "fuzzy" as const },
];

// Story component that demonstrates the hook
const PlaySearchDemo = ({
  initialQuery = "",
  playbookId,
  debounceMs = 200,
  minChars = 2,
  limit = 12,
  mockScenario = "success",
}: {
  initialQuery?: string;
  playbookId?: string;
  debounceMs?: number;
  minChars?: number;
  limit?: number;
  mockScenario?: "success" | "fuzzy" | "error" | "empty";
}) => {
  const { results, loading, query, setQuery, select, attemptedFuzzy, error } =
    usePlaySearch(initialQuery, {
      playbookId,
      debounceMs,
      minChars,
      limit,
    });

  // Mock the supabase responses based on scenario
  React.useEffect(() => {
    const mockRpc = supabase.rpc as jest.MockedFunction<typeof supabase.rpc>;

    if (mockScenario === "success") {
      mockRpc.mockImplementation((name: string) => {
        if (name === "search_plays") {
          return Promise.resolve({ data: mockFulltextResults, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });
    } else if (mockScenario === "fuzzy") {
      mockRpc.mockImplementation((name: string) => {
        if (name === "search_plays") {
          return Promise.resolve({ data: [], error: null });
        }
        if (name === "search_plays_fuzzy") {
          return Promise.resolve({ data: mockFuzzyResults, error: null });
        }
        return Promise.resolve({ data: null, error: null });
      });
    } else if (mockScenario === "error") {
      mockRpc.mockImplementation(() =>
        Promise.resolve({ data: null, error: new Error("Search failed") })
      );
    } else if (mockScenario === "empty") {
      mockRpc.mockImplementation(() =>
        Promise.resolve({ data: [], error: null })
      );
    }
  }, [mockScenario]);

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Play Search Demo</h3>
          <p className="text-sm text-gray-600 mb-4">
            Search for plays in the playbook. Try queries like "shotgun",
            "pass", or "run".
          </p>
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder={`Search plays (min ${minChars} chars)...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full"
          />

          <div className="flex items-center gap-2 text-sm">
            {loading && <span className="text-blue-500">Searching...</span>}
            {attemptedFuzzy && <Badge variant="info">Fuzzy search used</Badge>}
            {error && <Badge variant="danger">Error: {error}</Badge>}
            <span className="text-gray-500">{results.length} results</span>
          </div>
        </div>

        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.play_id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="font-medium">Play {result.play_id}</span>
                <Badge
                  variant={result.source === "fulltext" ? "info" : "neutral"}
                >
                  {result.source}
                </Badge>
                {result.rank && (
                  <span className="text-sm text-gray-500">
                    Rank: {(result.rank * 100).toFixed(0)}%
                  </span>
                )}
                {result.similarity && (
                  <span className="text-sm text-gray-500">
                    Similarity: {(result.similarity * 100).toFixed(0)}%
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => select(result.play_id)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>

        {results.length === 0 && query.length >= minChars && !loading && (
          <div className="text-center py-8 text-gray-500">
            No plays found for "{query}"
          </div>
        )}
      </div>
    </Card>
  );
};

export const Default: StoryObj = {
  render: () => <PlaySearchDemo />,
  parameters: {
    docs: {
      description: {
        story:
          "Basic play search with default settings and successful full-text results.",
      },
    },
  },
};

export const WithFuzzyFallback: StoryObj = {
  render: () => <PlaySearchDemo mockScenario="fuzzy" />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates fuzzy search fallback when full-text search returns no results.",
      },
    },
  },
};

export const WithErrorHandling: StoryObj = {
  render: () => <PlaySearchDemo mockScenario="error" />,
  parameters: {
    docs: {
      description: {
        story: "Shows error handling when search operations fail.",
      },
    },
  },
};

export const EmptyResults: StoryObj = {
  render: () => <PlaySearchDemo mockScenario="empty" />,
  parameters: {
    docs: {
      description: {
        story: "Displays empty state when no results are found.",
      },
    },
  },
};

export const CustomConfiguration: StoryObj = {
  render: () => (
    <PlaySearchDemo
      initialQuery="shotgun"
      debounceMs={500}
      minChars={3}
      limit={5}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Custom configuration with longer debounce, higher min chars, and limited results.",
      },
    },
  },
};

export const WithPlaybookFilter: StoryObj = {
  render: () => (
    <PlaySearchDemo playbookId="playbook-offensive-2024" initialQuery="pass" />
  ),
  parameters: {
    docs: {
      description: {
        story: "Search filtered to a specific playbook.",
      },
    },
  },
};
