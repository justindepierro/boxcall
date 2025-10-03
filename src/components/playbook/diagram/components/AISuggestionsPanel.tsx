import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../../../ui/Button";
import Icon from "../../../ui/Icon/Icon";
import { useDiagramEditor } from "../context/useDiagramEditor";

interface AISuggestion {
  id: string;
  type: "formation" | "route" | "personnel" | "play-type";
  title: string;
  description: string;
  confidence: number;
  action: () => void;
}

export const AISuggestionsPanel: React.FC = () => {
  const { state, dispatch } = useDiagramEditor();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Analyze current diagram and generate suggestions
  const analyzeDiagram = useCallback(async () => {
    setIsAnalyzing(true);

    // Simulate AI analysis (in real implementation, this would call an AI service)
    const mockSuggestions: AISuggestion[] = [];

    // Formation analysis
    const offensivePlayers = state.doc.players.filter((p) => p.side === "O");

    if (offensivePlayers.length >= 5) {
      // Suggest common formations based on personnel
      const wrCount = offensivePlayers.filter((p) => p.role === "WR").length;
      const rbCount = offensivePlayers.filter((p) => p.role === "RB").length;
      const teCount = offensivePlayers.filter((p) => p.role === "TE").length;

      if (wrCount >= 3 && rbCount >= 1) {
        mockSuggestions.push({
          id: "formation-11-personnel",
          type: "formation",
          title: "11 Personnel Formation",
          description: "Standard formation with 1 RB, 1 TE, 3 WRs",
          confidence: 0.85,
          action: () =>
            dispatch({ type: "APPLY_FORMATION", formation: "shotgun-11" }),
        });
      }

      if (wrCount >= 2 && teCount >= 2) {
        mockSuggestions.push({
          id: "formation-12-personnel",
          type: "formation",
          title: "12 Personnel Formation",
          description: "Heavy formation with 1 RB, 2 TEs, 2 WRs",
          confidence: 0.78,
          action: () =>
            dispatch({ type: "APPLY_FORMATION", formation: "shotgun-12" }),
        });
      }
    }

    // Route analysis
    const playersWithRoutes = state.doc.routes.length;
    if (playersWithRoutes === 0 && offensivePlayers.length >= 3) {
      mockSuggestions.push({
        id: "route-slants",
        type: "route",
        title: "Quick Slants",
        description: "Add quick slant routes for 3 receivers",
        confidence: 0.92,
        action: () => {
          // This would implement auto-route generation
          console.log("Auto-generating slant routes");
        },
      });
    }

    // Play type suggestions
    if (state.doc.routes.length >= 3) {
      mockSuggestions.push({
        id: "play-type-pass",
        type: "play-type",
        title: "Passing Play",
        description: "This looks like a passing concept",
        confidence: 0.88,
        action: () => {
          // Could update play metadata
          console.log("Classifying as passing play");
        },
      });
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  }, [state.doc, dispatch]);

  useEffect(() => {
    if (state.ui.tool === "ai-suggest") {
      analyzeDiagram();
    }
  }, [state.ui.tool, analyzeDiagram]);

  if (state.ui.tool !== "ai-suggest") {
    return null;
  }

  return (
    <div className="absolute right-4 top-20 w-80 bg-surface-card rounded-lg border border-border shadow-lg p-4 z-30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center">
          <Icon name="sparkles" className="h-5 w-5 mr-2 text-electric-500" />
          AI Suggestions
        </h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => dispatch({ type: "SET_TOOL", tool: "select" })}
          className="text-text-secondary hover:text-text-primary"
        >
          <Icon name="close" className="h-4 w-4" />
        </Button>
      </div>

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500"></div>
          <span className="ml-3 text-text-secondary">Analyzing play...</span>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <Icon name="search" className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No suggestions available</p>
          <p className="text-sm mt-1">
            Add more players and routes for AI analysis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="border border-border rounded-lg p-3 hover:bg-surface-subtle transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-text-primary text-sm">
                  {suggestion.title}
                </h4>
                <div className="flex items-center text-xs text-text-secondary">
                  <Icon name="target" className="h-3 w-3 mr-1" />
                  {Math.round(suggestion.confidence * 100)}%
                </div>
              </div>
              <p className="text-xs text-text-secondary mb-3">
                {suggestion.description}
              </p>
              <Button
                size="sm"
                variant="secondary"
                onClick={suggestion.action}
                className="w-full text-xs"
              >
                Apply Suggestion
              </Button>
            </div>
          ))}

          <div className="pt-3 border-t border-border">
            <Button
              size="sm"
              variant="ghost"
              onClick={analyzeDiagram}
              className="w-full text-text-secondary hover:text-text-primary"
            >
              <Icon name="refresh-cw" className="h-4 w-4 mr-2" />
              Re-analyze
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
