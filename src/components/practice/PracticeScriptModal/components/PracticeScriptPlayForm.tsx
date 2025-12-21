/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import { Button } from "../../../ui/Button/Button";
import { Input, TextArea } from "../../../ui";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon";
import { table } from "../../../../data/supabase/db";
import { getActiveTeamId } from "../../../../utils/activeTeam";
import {
  getDisplayName,
  type PlayNameSource,
} from "../../../../utils/playNameUtils";
import { PersonnelBadge } from "../../../playbook/PersonnelBadge";

import type { PracticeScriptPlay } from "../types";
import { debug, logError } from "../../../../utils/logger";

type PlaySearchItem = PlayNameSource & {
  id: string;
  personnel: string | null;
  diagram_image_url?: string | null;
};

interface PracticeScriptPlayFormProps {
  initialData?: PracticeScriptPlay;
  onSubmit: (play: Omit<PracticeScriptPlay, "id">) => void;
  onCancel: () => void;
}

export const PracticeScriptPlayForm: React.FC<PracticeScriptPlayFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Omit<PracticeScriptPlay, "id">>({
    playId: initialData?.playId,
    playName: initialData?.playName || "",
    personnel: initialData?.personnel || "",
    notes: initialData?.notes || "",
    defenseFront: initialData?.defenseFront || "",
    defensiveCoverage: initialData?.defensiveCoverage || "",
    blitz: initialData?.blitz || "",
    stunt: initialData?.stunt || "",
    hash: initialData?.hash || "",
    situation: initialData?.situation || "",
  });

  const [searchQuery, setSearchQuery] = useState(initialData?.playName || "");
  const [selectedPlay, setSelectedPlay] = useState<PlaySearchItem | null>(null);
  const [playbookPlays, setPlaybookPlays] = useState<PlaySearchItem[]>([]);
  const [isLoadingPlays, setIsLoadingPlays] = useState(false);

  // Load playbook plays
  useEffect(() => {
    const loadPlays = async () => {
      const teamId = getActiveTeamId();
      if (!teamId) return;

      setIsLoadingPlays(true);
      try {
        const { data: playbooks } = await table("playbooks")
          .select("id")
          .eq("team_id", teamId)
          .eq("is_active", true)
          .limit(1);

        if (playbooks && playbooks.length > 0) {
          const { data: plays, error } = await table("plays")
            .select(
              "id,play_name,formation,personnel,p_type,diagram_image_url,diagram_url,f_dir,f_type,back_align,shift,motion,ftag1,ftag2,p_dir,protection,p_tag1,p_tag2,one_word_play,r_str,p_str"
            )
            .eq("playbook_id", playbooks[0].id)
            .order("play_name");

          if (error) {
            logError("❌ Error loading plays:", error);
          } else {
            debug("✅ Loaded plays:", plays?.length || 0);
            if (plays && plays.length > 0) {
              debug("📋 Sample play:", plays[0]);
            }
            setPlaybookPlays(plays || []);
          }
        } else {
          debug("⚠️ No active playbook found for team");
        }
      } catch (error) {
        logError("Failed to load playbook plays:", error);
      } finally {
        setIsLoadingPlays(false);
      }
    };

    loadPlays();
  }, []);

  const filteredPlays = useMemo(() => {
    debug("🔍 Filtering plays:", {
      totalPlays: playbookPlays.length,
      searchQuery,
    });

    if (searchQuery === "") {
      return playbookPlays;
    }

    const filtered = playbookPlays.filter((play) => {
      // Search by the display name (formatted name) instead of raw play_name
      const displayName = getDisplayName(play, false);
      const matches = displayName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (matches) {
        debug("✅ Match found:", displayName);
      }

      return matches;
    });

    debug("📊 Filtered results:", filtered.length);
    return filtered;
  }, [playbookPlays, searchQuery]);

  const handleSelectPlay = useCallback((play: PlaySearchItem | null) => {
    debug("🎯 Play selected:", play?.play_name);

    if (play) {
      // Use the same display name logic as the list view
      const displayName = getDisplayName(play, false);
      debug("📝 Formatted display name:", displayName);

      setSelectedPlay(play);
      setFormData((prev) => ({
        ...prev,
        playId: play.id,
        playName: displayName, // Store the formatted display name
        personnel: play.personnel || prev.personnel,
      }));
      setSearchQuery(displayName);
    }
  }, []);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.playName.trim()) {
      // TODO: Show validation error
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Play Name - with search functionality */}
      <div>
        <Typography variant="label-md" className="block mb-1">
          Play Name *
        </Typography>
        <Combobox value={selectedPlay} onChange={handleSelectPlay}>
          <div className="relative">
            <Combobox.Input
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-primary placeholder-muted focus:border-jade-500 focus:outline-none focus:ring-1 focus:ring-jade-500"
              displayValue={(play: PlaySearchItem | null) => {
                if (play) {
                  const displayName = getDisplayName(play, false);
                  debug("📺 Display value for selected play:", displayName);
                  return displayName;
                }
                return searchQuery;
              }}
              onChange={(event) => {
                const value = event.target.value;
                debug("⌨️ Input changed:", value);
                setSearchQuery(value);
                updateField("playName", value);
              }}
              placeholder="Search playbook or enter custom play name"
              required
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <Icon
                name="chevron-down"
                className="h-5 w-5 text-muted"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>

          <Combobox.Options className="absolute z-[100] mt-1 max-h-96 w-full overflow-auto rounded-md bg-surface border border-border shadow-2xl">
            {(() => {
              if (isLoadingPlays)
                return (
                  <div className="px-4 py-3 text-sm text-muted flex items-center gap-2">
                    <Icon name="loader-2" className="animate-spin" size={16} />
                    Loading plays...
                  </div>
                );
              if (filteredPlays.length === 0)
                return (
                  <div className="px-4 py-3 text-sm text-muted">
                    No plays found. Enter a custom play name.
                  </div>
                );
              return (
                <div className="divide-y divide-border">
                  {filteredPlays.map((play) => {
                    // Use the same display logic as the playbook list view
                    const displayName = getDisplayName(play, false);

                    return (
                      <Combobox.Option
                        key={play.id}
                        value={play}
                        className={({ active }) =>
                          `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                            active ? "bg-accent" : "bg-surface hover:bg-accent"
                          }`
                        }
                      >
                        {/* Thumbnail (if available) */}
                        {play.diagram_image_url && (
                          <div className="shrink-0 w-16 h-12 rounded-lg overflow-hidden shadow-sm">
                            <img
                              src={play.diagram_image_url}
                              alt={`${displayName} diagram`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Play info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-mono font-semibold text-sm text-primary truncate">
                            {displayName}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Personnel badge */}
                            {play.personnel && (
                              <PersonnelBadge
                                personnel={play.personnel}
                                size="sm"
                              />
                            )}
                            {/* Play type badge */}
                            {play.p_type && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs font-medium">
                                {play.p_type}
                              </span>
                            )}
                            {/* Formation */}
                            {play.formation && (
                              <span className="text-xs text-secondary truncate">
                                {play.formation}
                              </span>
                            )}
                          </div>
                        </div>
                      </Combobox.Option>
                    );
                  })}
                </div>
              );
            })()}
          </Combobox.Options>
        </Combobox>
        <Typography variant="caption" color="muted" className="mt-1">
          Start typing to search existing plays, or enter a custom play name
        </Typography>
      </div>

      {/* Personnel */}
      <div>
        <Typography variant="label-md" className="block mb-1">
          Personnel
        </Typography>
        <Input
          value={formData.personnel}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            updateField("personnel", e.target.value)
          }
          placeholder="e.g., 11 Personnel"
        />
      </div>

      {/* Notes */}
      <div>
        <Typography variant="label-md" className="block mb-1">
          Notes
        </Typography>
        <TextArea
          value={formData.notes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            updateField("notes", e.target.value)
          }
          placeholder="Additional notes about this play"
          rows={3}
        />
      </div>

      {/* Defense Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography variant="label-md" className="block mb-1">
            Defense Front
          </Typography>
          <Input
            value={formData.defenseFront}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("defenseFront", e.target.value)
            }
            placeholder="e.g., 4-3, 3-4"
          />
        </div>

        <div>
          <Typography variant="label-md" className="block mb-1">
            Defensive Coverage
          </Typography>
          <Input
            value={formData.defensiveCoverage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("defensiveCoverage", e.target.value)
            }
            placeholder="e.g., Cover 2, Man"
          />
        </div>

        <div>
          <Typography variant="label-md" className="block mb-1">
            Blitz
          </Typography>
          <Input
            value={formData.blitz}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("blitz", e.target.value)
            }
            placeholder="e.g., Edge Blitz"
          />
        </div>

        <div>
          <Typography variant="label-md" className="block mb-1">
            Stunt
          </Typography>
          <Input
            value={formData.stunt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("stunt", e.target.value)
            }
            placeholder="e.g., Twist"
          />
        </div>
      </div>

      {/* Hash and Situation */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Typography variant="label-md" className="block mb-1">
            Hash
          </Typography>
          <Input
            value={formData.hash}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("hash", e.target.value)
            }
            placeholder="e.g., Left, Right, Middle"
          />
        </div>

        <div>
          <Typography variant="label-md" className="block mb-1">
            Situation
          </Typography>
          <Input
            value={formData.situation}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateField("situation", e.target.value)
            }
            placeholder="e.g., 3rd & 5, Red Zone"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? "Update Play" : "Add Play"}
        </Button>
      </div>
    </form>
  );
};
