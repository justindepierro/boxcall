import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { usePlaySearch } from "./usePlaySearch";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

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
  tags: ["autodocs"],
};

export default meta;

const PlaySearchDemo: React.FC<{
  initialQuery?: string;
  playbookId?: string;
  debounceMs?: number;
  minChars?: number;
  limit?: number;
}> = ({
  initialQuery = "",
  playbookId,
  debounceMs = 300,
  minChars = 2,
  limit = 10,
}) => {
  const { results, loading, query, setQuery, select, attemptedFuzzy, error } =
    usePlaySearch(initialQuery, {
      playbookId,
      debounceMs,
      minChars,
      limit,
    });

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Play Search Demo</h3>
          <p className="text-sm text-secondary mb-4">
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
          />

          <div className="flex gap-2">
            <Badge variant={loading ? "warning" : "neutral"}>
              {loading ? "Searching..." : "Ready"}
            </Badge>
            {attemptedFuzzy && <Badge variant="info">Fuzzy Search Used</Badge>}
            {error && <Badge variant="danger">Error</Badge>}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Results ({results?.length || 0})</h4>
          {results && results.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((play, index) => (
                <Card key={play.play_id || index} className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">Play {play.play_id}</h5>
                      <p className="text-sm text-secondary">
                        {play.source} search • Rank: {play.rank || "N/A"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => select?.(play.play_id)}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : query.length >= minChars ? (
            <p className="text-sm text-gray-500">
              {loading ? "Searching..." : "No results found"}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Enter at least {minChars} characters to search
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-error-bg border border-error-200 rounded">
            <p className="text-sm text-error-800">Error: {error}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export const Default: StoryObj = {
  render: () => <PlaySearchDemo />,
};

export const WithCustomConfiguration: StoryObj = {
  render: () => (
    <PlaySearchDemo
      debounceMs={500}
      minChars={3}
      limit={5}
      initialQuery="shotgun"
    />
  ),
};

export const WithPlaybookFilter: StoryObj = {
  render: () => (
    <PlaySearchDemo playbookId="playbook-123" initialQuery="pass" />
  ),
};
