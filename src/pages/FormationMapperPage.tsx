/**
 * ⚠️ DEPRECATED PAGE - Formation Mapper
 *
 * This page was designed to pair formation variants (Left/Right) using a separate
 * formations table. As of November 28, 2025, BoxCall uses the simplified approach:
 *
 * - Formation names stored as TEXT in plays table
 * - Direction detected from name suffix ("Shotgun Trips Left" vs "Shotgun Trips Right")
 * - No separate formations table needed
 * - No formation pairing/matching needed
 *
 * This page remains for backwards compatibility but may be removed in future versions.
 *
 * See: docs/FORMATION_FIX_COMPLETE_NOV28_2025.md
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { PageLayout } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button/Button";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal/Modal";
import { SelectionCheckbox } from "../components/ui/SelectionCheckbox/SelectionCheckbox";
import { useFormationAudit } from "../hooks/useFormationAudit";
import { useActiveTeamStore } from "../stores/activeTeamStore";
import type { Play } from "../types/play";
import { FormationSelector } from "../components/playbook/FormationSelector";
import { ensureValidFormation } from "../utils/formationGuard";
import { SecurePlaysService } from "../services/securePlaysService";
import { triggerHapticFeedback } from "../lib/hapticFeedback";
import { useTeamsData } from "../hooks/useTeamsData";
import { useToast } from "../hooks/useToast";
import {
  useRecentPlayCombos,
  type PlayCombo,
} from "../hooks/useRecentPlayCombos";
import type { Formation } from "../types/formation";
import { FormationService } from "../services/formationService";
import { cn } from "../lib/utils/cn";

interface FormationSuggestion {
  formation: Formation;
  score: number;
  reasons: string[];
}

export default function FormationMapperPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { activeTeamId } = useActiveTeamStore();
  const { playbooks } = useTeamsData();
  const { combos } = useRecentPlayCombos(12);

  const teamPlaybooks = useMemo(
    () => playbooks.filter((pb) => pb.team_id === activeTeamId && pb.is_active),
    [playbooks, activeTeamId]
  );

  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string>("");
  const selectedPlaybook = useMemo(
    () => teamPlaybooks.find((pb) => pb.id === selectedPlaybookId) || null,
    [teamPlaybooks, selectedPlaybookId]
  );

  const { plays, loading, error, refresh } = useFormationAudit(
    selectedPlaybookId || null
  );

  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(
    null
  );
  const [formationCatalog, setFormationCatalog] = useState<Formation[]>([]);
  const [formationsLoading, setFormationsLoading] = useState(false);
  const [formationsError, setFormationsError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [selectedPlayIds, setSelectedPlayIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkAssignFormation, setBulkAssignFormation] =
    useState<Formation | null>(null);

  useEffect(() => {
    if (teamPlaybooks.length === 0) return;

    const storageKey = `bc_active_playbook_${activeTeamId}`;
    const savedPlaybookId = localStorage.getItem(storageKey);

    if (
      savedPlaybookId &&
      teamPlaybooks.some((playbook) => playbook.id === savedPlaybookId)
    ) {
      setSelectedPlaybookId(savedPlaybookId);
    } else {
      setSelectedPlaybookId(teamPlaybooks[0].id);
    }
  }, [teamPlaybooks, activeTeamId]);

  const handlePlaybookChange = (playbookId: string) => {
    setSelectedPlaybookId(playbookId);
    localStorage.setItem(`bc_active_playbook_${activeTeamId}`, playbookId);
    setSelectedPlayIds(new Set());
  };

  const loadFormations = useCallback(
    async (playbookId: string | null | undefined) => {
      if (!playbookId) {
        setFormationCatalog([]);
        return;
      }

      setFormationsLoading(true);
      setFormationsError(null);
      try {
        const data = await FormationService.getFormationsByPlaybook(playbookId);
        setFormationCatalog(data);
      } catch (err) {
        console.error("Failed to load formation catalog", err);
        setFormationCatalog([]);
        setFormationsError(
          err instanceof Error
            ? err.message
            : "Failed to load formations for suggestions"
        );
      } finally {
        setFormationsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadFormations(selectedPlaybookId || null);
  }, [selectedPlaybookId, loadFormations]);

  useEffect(() => {
    setSelectedPlayIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(plays.map((play) => play.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      if (changed || next.size !== prev.size) {
        return next;
      }
      return prev;
    });
  }, [plays]);

  const suggestionsByPlay = useMemo(() => {
    if (plays.length === 0 || formationCatalog.length === 0) {
      return new Map<string, FormationSuggestion[]>();
    }

    const sanitize = (value?: string | null) =>
      (value || "").trim().toLowerCase();
    const normalize = (value?: string | null) =>
      sanitize(value).replace(/[^a-z0-9]/g, "");

    const combosByFormationId = new Map<string, PlayCombo[]>();
    const combosByName = new Map<string, PlayCombo[]>();

    combos.forEach((combo) => {
      if (combo.formationId) {
        const bucket = combosByFormationId.get(combo.formationId) ?? [];
        bucket.push(combo);
        combosByFormationId.set(combo.formationId, bucket);
      }

      const normalizedName = normalize(combo.formation);
      if (normalizedName) {
        const bucket = combosByName.get(normalizedName) ?? [];
        bucket.push(combo);
        combosByName.set(normalizedName, bucket);
      }
    });

    return plays.reduce((map, play) => {
      const playFormationNormalized = normalize(play.formation);
      const playFormationSanitized = sanitize(play.formation);
      const playPersonnel = sanitize(play.personnel);
      const playType = sanitize(play.p_type);
      const playDirection = sanitize(
        play.f_dir || (play.formation_direction as string | undefined)
      );

      const suggestions: FormationSuggestion[] = [];

      formationCatalog.forEach((formation) => {
        const formationNameNormalized = normalize(formation.name);
        const formationNameSanitized = sanitize(formation.name);
        const formationPersonnel = sanitize(formation.personnel_name);
        const formationDirection = sanitize(formation.direction);

        let score = 0;
        const reasons: string[] = [];

        if (playFormationNormalized && formationNameNormalized) {
          if (playFormationNormalized === formationNameNormalized) {
            score += 6;
            reasons.push("Exact name match");
          } else if (
            playFormationNormalized.includes(formationNameNormalized) ||
            formationNameNormalized.includes(playFormationNormalized)
          ) {
            score += 3;
            reasons.push("Similar name");
          } else if (
            playFormationSanitized &&
            formationNameSanitized &&
            playFormationSanitized.includes(formationNameSanitized)
          ) {
            score += 2;
            reasons.push("Partial name match");
          }
        }

        if (playPersonnel && formationPersonnel) {
          if (playPersonnel === formationPersonnel) {
            score += 3;
            reasons.push(`${formation.personnel_name} personnel`);
          } else if (
            playPersonnel.includes(formationPersonnel) ||
            formationPersonnel.includes(playPersonnel)
          ) {
            score += 1;
            reasons.push("Personnel overlap");
          }
        }

        if (playDirection && formationDirection) {
          if (playDirection.startsWith(formationDirection)) {
            score += 1;
            reasons.push(`${formation.direction} side`);
          }
        }

        const recentCombos = [
          ...(formation.id
            ? (combosByFormationId.get(formation.id) ?? [])
            : []),
          ...(formationNameNormalized
            ? (combosByName.get(formationNameNormalized) ?? [])
            : []),
        ];

        if (recentCombos.length > 0) {
          score += 2;
          reasons.push("Recent pick");
          if (
            playPersonnel &&
            recentCombos.some(
              (combo) => sanitize(combo.personnel) === playPersonnel
            )
          ) {
            score += 1;
          }
          if (
            playType &&
            recentCombos.some((combo) => sanitize(combo.playType) === playType)
          ) {
            score += 1;
          }
        }

        if (formation.usage_count > 0) {
          score += Math.min(2, Math.floor(formation.usage_count / 25));
        }

        if (score > 0) {
          suggestions.push({
            formation,
            score,
            reasons,
          });
        }
      });

      suggestions.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.formation.usage_count ?? 0) - (a.formation.usage_count ?? 0);
      });

      map.set(play.id, suggestions.slice(0, 3));
      return map;
    }, new Map<string, FormationSuggestion[]>());
  }, [plays, formationCatalog, combos]);

  const selectedPlays = useMemo(
    () => plays.filter((play) => selectedPlayIds.has(play.id)),
    [plays, selectedPlayIds]
  );
  const selectedCount = selectedPlays.length;
  const allSelected = plays.length > 0 && selectedCount === plays.length;

  const selectedSuggestionsCount = useMemo(() => {
    if (selectedPlays.length === 0) return 0;
    return selectedPlays.reduce((count, play) => {
      const suggestions = suggestionsByPlay.get(play.id) ?? [];
      return count + (suggestions.length > 0 ? 1 : 0);
    }, 0);
  }, [selectedPlays, suggestionsByPlay]);

  const canApplySuggestions = selectedSuggestionsCount > 0 && !assigning;
  const canBulkAssign = selectedCount > 0 && !assigning;

  const handleSelectPlay = useCallback(
    (playId: string, isSelected: boolean) => {
      setSelectedPlayIds((prev) => {
        const next = new Set(prev);
        if (isSelected) {
          next.add(playId);
        } else {
          next.delete(playId);
        }
        return next;
      });
    },
    []
  );

  const handleClearSelection = useCallback(() => {
    setSelectedPlayIds(new Set());
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedPlayIds((prev) => {
      if (plays.length === 0) {
        return new Set();
      }
      if (prev.size === plays.length) {
        return new Set();
      }
      return new Set(plays.map((play) => play.id));
    });
  }, [plays]);

  const total = plays.length;
  const unresolved = total;
  const lastUpdated = useMemo(() => {
    if (plays.length === 0) return null;
    const mostRecent = plays.reduce((latest, play) => {
      const updated = new Date(play.updated_at);
      return updated > latest ? updated : latest;
    }, new Date(0));
    return formatDistanceToNow(mostRecent, { addSuffix: true });
  }, [plays]);

  const assignFormations = useCallback(
    async (
      groups: Array<{ formation: Formation; plays: Play[] }>,
      options?: { successTitle?: string; successMessage?: string }
    ): Promise<boolean> => {
      const validGroups = groups
        .map((group) => ({
          formation: group.formation,
          plays: group.plays.filter(Boolean),
        }))
        .filter((group) => group.formation && group.plays.length > 0);

      if (validGroups.length === 0) {
        return false;
      }

      setAssigning(true);
      triggerHapticFeedback("light");
      let didSucceed = false;

      try {
        for (const group of validGroups) {
          const { formation, plays: groupPlays } = group;
          if (!formation || groupPlays.length === 0) continue;

          await ensureValidFormation({
            playbookId: groupPlays[0].playbook_id,
            formationId: formation.id,
            allowCustom: false,
          });

          const timestamp = new Date().toISOString();

          await Promise.all(
            groupPlays.map((play) =>
              SecurePlaysService.updatePlay(play.id, {
                formation_id: formation.id,
                formation: formation.name,
                formation_status: "ok",
                formation_direction: formation.direction ?? null,
                sanitized_at: timestamp,
              })
            )
          );
        }

        triggerHapticFeedback("success");

        const totalPlays = validGroups.reduce(
          (sum, group) => sum + group.plays.length,
          0
        );

        const uniqueFormationNames = [
          ...new Set(validGroups.map((group) => group.formation.name)),
        ];

        const defaultTitle =
          totalPlays === 1 ? "Formation Linked" : "Formations Linked";

        let defaultMessage: string;
        if (totalPlays === 1) {
          const playName = validGroups[0].plays[0].play_name || "play";
          defaultMessage = `Linked ${playName} to ${validGroups[0].formation.name}`;
        } else if (uniqueFormationNames.length === 1) {
          defaultMessage = `Linked ${totalPlays} plays to ${uniqueFormationNames[0]}`;
        } else {
          defaultMessage = `Linked ${totalPlays} plays across ${uniqueFormationNames.length} formations`;
        }

        toast.success(
          options?.successMessage ?? defaultMessage,
          options?.successTitle ?? defaultTitle
        );

        await refresh();
        didSucceed = true;
      } catch (err) {
        console.error("Formation assignment failed", err);
        toast.error(
          err instanceof Error ? err.message : "Failed to assign formation",
          "Link Failed"
        );
      } finally {
        setAssigning(false);
      }

      return didSucceed;
    },
    [refresh, toast]
  );

  const handleSuggestionAssign = useCallback(
    async (play: Play, suggestion: FormationSuggestion) => {
      const success = await assignFormations(
        [{ formation: suggestion.formation, plays: [play] }],
        {
          successTitle: "Suggestion Applied",
          successMessage: `Linked ${play.play_name || "play"} to ${suggestion.formation.name}`,
        }
      );

      if (success) {
        setSelectedPlayIds((prev) => {
          if (!prev.has(play.id)) {
            return prev;
          }
          const next = new Set(prev);
          next.delete(play.id);
          return next;
        });
      }
    },
    [assignFormations]
  );

  const handleAssignFormation = useCallback(async () => {
    if (!editingPlay || !selectedFormation) return;

    const success = await assignFormations(
      [{ formation: selectedFormation, plays: [editingPlay] }],
      {
        successMessage: `Linked ${editingPlay.play_name || "play"} to ${selectedFormation.name}`,
      }
    );

    if (success) {
      setEditingPlay(null);
      setSelectedFormation(null);
    }
  }, [assignFormations, editingPlay, selectedFormation]);

  const handleBulkAssignConfirm = useCallback(async () => {
    if (!bulkAssignFormation || selectedPlays.length === 0) return;

    const success = await assignFormations(
      [{ formation: bulkAssignFormation, plays: selectedPlays }],
      {
        successTitle: "Formation Linked",
        successMessage: `Linked ${selectedPlays.length} selected play${selectedPlays.length === 1 ? "" : "s"} to ${bulkAssignFormation.name}`,
      }
    );

    if (success) {
      setBulkAssignOpen(false);
      setBulkAssignFormation(null);
      setSelectedPlayIds(new Set());
    }
  }, [assignFormations, bulkAssignFormation, selectedPlays]);

  const handleBulkApplySuggestions = useCallback(async () => {
    if (selectedPlays.length === 0) return;

    const groupsMap = new Map<
      string,
      { formation: Formation; plays: Play[] }
    >();

    selectedPlays.forEach((play) => {
      const suggestion = suggestionsByPlay.get(play.id)?.[0];
      if (!suggestion) return;
      const key = suggestion.formation.id;
      const existing = groupsMap.get(key);
      if (existing) {
        existing.plays.push(play);
      } else {
        groupsMap.set(key, { formation: suggestion.formation, plays: [play] });
      }
    });

    const groups = Array.from(groupsMap.values());
    const appliedCount = groups.reduce(
      (sum, group) => sum + group.plays.length,
      0
    );

    if (appliedCount === 0) {
      toast.error(
        "No suggestions available for the selected plays",
        "No Suggestions"
      );
      return;
    }

    const success = await assignFormations(groups, {
      successTitle: "Suggestions Applied",
      successMessage: `Applied suggestions to ${appliedCount} play${appliedCount === 1 ? "" : "s"}`,
    });

    if (success) {
      const remainingCount = selectedCount - appliedCount;

      setSelectedPlayIds((prev) => {
        const next = new Set(prev);
        groups.forEach((group) => {
          group.plays.forEach((play) => next.delete(play.id));
        });
        return next;
      });

      if (remainingCount > 0) {
        toast.info(
          `${remainingCount} play${remainingCount === 1 ? "" : "s"} still need a manual assignment.`,
          "Remaining Plays"
        );
      }
    }
  }, [
    assignFormations,
    selectedPlays,
    selectedCount,
    suggestionsByPlay,
    toast,
  ]);

  const renderPlayRow = (play: Play) => {
    const updatedAt = play.updated_at
      ? formatDistanceToNow(new Date(play.updated_at), { addSuffix: true })
      : "unknown";

    const suggestions = suggestionsByPlay.get(play.id) ?? [];
    const isSelected = selectedPlayIds.has(play.id);

    return (
      <div
        key={play.id}
        className={cn(
          "rounded-lg border border-border bg-secondary/70 p-4 transition-shadow",
          isSelected && "border-brand-jade shadow-lg shadow-brand-jade/20"
        )}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] items-start">
          <div className="min-w-0 flex flex-col gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <SelectionCheckbox
                isSelected={isSelected}
                onChange={(selected) => handleSelectPlay(play.id, selected)}
                label={`Select ${play.play_name || "play"}`}
                disabled={assigning}
              />
              <div className="min-w-0">
                <Typography
                  variant="body-md"
                  className="font-semibold truncate"
                >
                  {play.play_name || "Untitled Play"}
                </Typography>
                <Typography variant="caption" className="text-muted">
                  Updated {updatedAt}
                </Typography>
                {formationsLoading && suggestions.length === 0 ? (
                  <Typography variant="caption" className="text-secondary mt-2">
                    Loading suggestions…
                  </Typography>
                ) : suggestions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        key={`${play.id}-${suggestion.formation.id}`}
                        variant="secondary"
                        size="xs"
                        disabled={assigning}
                        onClick={() => handleSuggestionAssign(play, suggestion)}
                        className="flex items-center gap-2 max-w-xs"
                        title={suggestion.reasons.join(", ") || undefined}
                      >
                        <Icon
                          name="sparkles"
                          className="h-3 w-3 text-success-500"
                        />
                        <span className="truncate">
                          {suggestion.formation.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <Typography variant="caption" className="text-secondary mt-2">
                    No smart suggestions yet — assign manually to train the
                    mapper.
                  </Typography>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <Typography variant="caption" className="text-muted uppercase">
              Formation String
            </Typography>
            <Typography variant="body-sm" className="text-primary break-words">
              {play.formation || "—"}
            </Typography>
          </div>
          <div className="space-y-1">
            <Typography variant="caption" className="text-muted uppercase">
              Personnel
            </Typography>
            <Typography variant="body-sm" className="text-primary">
              {play.personnel || "—"}
            </Typography>
          </div>
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              disabled={assigning}
              onClick={() => {
                triggerHapticFeedback("light");
                setEditingPlay(play);
                setSelectedFormation(null);
              }}
            >
              Assign formation
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={assigning}
              onClick={() => {
                triggerHapticFeedback("light");
                setEditingPlay(play);
                setSelectedFormation(null);
                setShowBuilder(true);
              }}
            >
              Create new
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout
      title="Formation Mapper"
      subtitle="Review plays without linked formations and assign the proper versions."
      variant="list"
      actions={
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {teamPlaybooks.length > 0 && (
            <select
              value={selectedPlaybookId}
              onChange={(event) => handlePlaybookChange(event.target.value)}
              className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-brand-jade"
            >
              {teamPlaybooks.map((playbook) => (
                <option key={playbook.id} value={playbook.id}>
                  {playbook.name || "Unnamed Playbook"}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2 justify-end">
            {plays.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleSelectAll}
                disabled={assigning}
              >
                {allSelected ? "Clear selection" : "Select all"}
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              disabled={assigning}
            >
              <Icon name="arrow-left" className="h-4 w-4 mr-2" /> Back
            </Button>
            <Button
              variant="secondary"
              onClick={refresh}
              disabled={loading || assigning}
            >
              <Icon
                name="refresh-cw"
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Card variant="glass" size="lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Typography variant="headline-sm" className="text-primary">
                Mapping Overview
              </Typography>
              <Typography variant="body-sm" className="text-secondary">
                {selectedPlaybook
                  ? `Playbook: ${selectedPlaybook.name}`
                  : "Select a playbook to review formation mappings."}
              </Typography>
              <Typography variant="body-xs" className="text-secondary mt-1">
                {unresolved === 0
                  ? "All plays are synced to formations."
                  : `${unresolved} play${unresolved === 1 ? "" : "s"} need formation mapping.`}
              </Typography>
            </div>
            <div className="flex gap-4 text-sm text-muted">
              <div>
                <Typography variant="caption" className="uppercase">
                  Total plays
                </Typography>
                <Typography
                  variant="body-md"
                  className="font-semibold text-primary"
                >
                  {total}
                </Typography>
              </div>
              <div>
                <Typography variant="caption" className="uppercase">
                  Last updated
                </Typography>
                <Typography
                  variant="body-md"
                  className="font-semibold text-primary"
                >
                  {lastUpdated || "—"}
                </Typography>
              </div>
            </div>
          </div>
        </Card>

        {error && (
          <Card variant="glass" size="md" className="border-error-300">
            <div className="flex items-center gap-3 text-error-600">
              <Icon name="alert-circle" className="h-5 w-5" />
              <Typography variant="body-sm">{error}</Typography>
            </div>
          </Card>
        )}

        {formationsError && (
          <Card variant="glass" size="md" className="border-warning-300">
            <div className="flex items-center gap-3 text-warning-600">
              <Icon name="alert-triangle" className="h-5 w-5" />
              <Typography variant="body-sm">
                {formationsError}. Suggestions may be limited until this
                reloads.
              </Typography>
            </div>
          </Card>
        )}

        {loading ? (
          <Card variant="glass" size="lg">
            <div className="flex items-center gap-2">
              <Icon name="loader" className="h-5 w-5 animate-spin text-muted" />
              <Typography variant="body-sm" className="text-secondary">
                Loading plays needing formation mapping...
              </Typography>
            </div>
          </Card>
        ) : plays.length === 0 ? (
          <Card variant="glass" size="lg" className="text-center space-y-3">
            <Icon
              name="check-circle"
              className="mx-auto h-10 w-10 text-success-500"
            />
            <Typography variant="headline-sm" className="text-primary">
              All synced!
            </Typography>
            <Typography variant="body-sm" className="text-secondary">
              Every play in this playbook is linked to a formation.
            </Typography>
            <Button variant="secondary" onClick={() => navigate("/playbook")}>
              Back to Playbook
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3">{plays.map(renderPlayRow)}</div>
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="fixed bottom-4 left-1/2 z-40 w-full max-w-4xl -translate-x-1/2 px-4">
          <div className="rounded-xl border border-border bg-primary shadow-xl flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Icon name="check-circle" className="h-5 w-5 text-success-500" />
              <div>
                <Typography
                  variant="body-md"
                  className="font-semibold text-primary"
                >
                  {selectedCount} play{selectedCount === 1 ? "" : "s"} selected
                </Typography>
                <Typography variant="caption" className="text-secondary">
                  {selectedSuggestionsCount > 0
                    ? `${selectedSuggestionsCount} selection${selectedSuggestionsCount === 1 ? "" : "s"} have suggestions ready`
                    : "No suggestions available yet"}
                </Typography>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={assigning}
              >
                Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBulkAssignOpen(true)}
                disabled={!canBulkAssign}
              >
                <Icon name="grid" className="h-4 w-4 mr-2" />
                Assign formation
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBulkApplySuggestions}
                disabled={!canApplySuggestions}
              >
                <Icon name="sparkles" className="h-4 w-4 mr-2" />
                Apply suggestions
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(editingPlay) && !showBuilder}
        onClose={() => {
          if (assigning) return;
          setEditingPlay(null);
          setSelectedFormation(null);
        }}
        title="Link Formation"
        size="md"
      >
        {editingPlay && (
          <div className="space-y-5">
            <div>
              <Typography variant="body-md" className="text-primary">
                {editingPlay.play_name || "Untitled Play"}
              </Typography>
              <Typography variant="caption" className="text-secondary">
                Current string: {editingPlay.formation || "—"}
              </Typography>
            </div>
            <FormationSelector
              playbookId={editingPlay.playbook_id}
              value={selectedFormation?.id || null}
              onChange={(formationId, formation) => {
                if (formationId && formation) {
                  setSelectedFormation(formation);
                } else {
                  setSelectedFormation(null);
                }
              }}
              onCreateNew={() => setShowBuilder(true)}
              disabled={assigning}
              onFormationsLoaded={setFormationCatalog}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (!assigning) {
                    setEditingPlay(null);
                    setSelectedFormation(null);
                  }
                }}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignFormation}
                disabled={!selectedFormation || assigning}
              >
                Assign
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={bulkAssignOpen}
        onClose={() => {
          if (assigning) return;
          setBulkAssignOpen(false);
          setBulkAssignFormation(null);
        }}
        title={`Assign Formation (${selectedCount} selected)`}
        size="md"
      >
        <div className="space-y-5">
          <Typography variant="body-sm" className="text-secondary">
            Choose a formation to link to the selected plays.
          </Typography>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-secondary/60 p-3">
            <Typography
              variant="caption"
              className="text-muted uppercase tracking-wide"
            >
              Selected plays
            </Typography>
            <ul className="mt-2 space-y-1">
              {selectedPlays.slice(0, 6).map((play) => (
                <li key={play.id} className="text-sm text-primary truncate">
                  {play.play_name || "Untitled Play"}
                </li>
              ))}
              {selectedCount > 6 && (
                <li className="text-xs text-secondary">
                  +{selectedCount - 6} more
                </li>
              )}
              {selectedCount === 0 && (
                <li className="text-xs text-secondary">No plays selected</li>
              )}
            </ul>
          </div>
          <FormationSelector
            playbookId={
              selectedPlaybookId || selectedPlays[0]?.playbook_id || ""
            }
            value={bulkAssignFormation?.id || null}
            onChange={(formationId, formation) => {
              if (formationId && formation) {
                setBulkAssignFormation(formation);
              } else {
                setBulkAssignFormation(null);
              }
            }}
            disabled={assigning || selectedCount === 0 || !selectedPlaybookId}
            onFormationsLoaded={setFormationCatalog}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (!assigning) {
                  setBulkAssignOpen(false);
                  setBulkAssignFormation(null);
                }
              }}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkAssignConfirm}
              disabled={
                !bulkAssignFormation || assigning || selectedCount === 0
              }
            >
              Assign to selected
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
}
