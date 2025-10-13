/**
 * useFormationAnalysis Hook
 * Analyzes offensive formation and provides metrics
 */

import * as React from "react";
import type { Player } from "../../../types/Player";
import type { Alignment } from "../types";
import { analyzeFormation } from "@features/defense/analyzers/formationAnalyzer";
import type { FormationAnalysis } from "@features/defense/types";

interface UseFormationAnalysisProps {
  players: Player[];
  selectedAlignment: Alignment;
}

export function useFormationAnalysis({
  players,
  selectedAlignment,
}: UseFormationAnalysisProps) {
  const [formationAnalysis, setFormationAnalysis] =
    React.useState<FormationAnalysis | null>(null);

  // Analyze offensive formation whenever players or alignment changes
  React.useEffect(() => {
    try {
      const analysis = analyzeFormation(players, selectedAlignment);
      setFormationAnalysis(analysis);

      // Log formation data for debugging
      console.log("🔍 Formation Analysis:");
      console.log(`  Formation Type: ${analysis.type}`);
      console.log(`  Strength: ${analysis.strengthSide}`);
      console.log(`  Receivers Left: ${analysis.receiversLeft}`);
      console.log(`  Receivers Right: ${analysis.receiversRight}`);
      console.log(`  Box Count: ${analysis.boxCount}`);
      console.log(`  RB Position: ${analysis.rbPosition}`);
      console.log(`  Tight End Present: ${analysis.tightEndPresent}`);
    } catch (error) {
      console.error("Formation analysis error:", error);
      setFormationAnalysis(null);
    }
  }, [players, selectedAlignment]);

  return formationAnalysis;
}
