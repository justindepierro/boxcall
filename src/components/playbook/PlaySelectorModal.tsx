import React, { useState, useEffect, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import { Badge } from "../ui/Badge";
import type { Play } from "../../types/play";

interface PlaySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay: (play: Play) => void;
  teamId?: string; // For excluding already selected plays
  selectedPlayIds?: string[]; // For excluding already selected plays
}

export const PlaySelectorModal: React.FC<PlaySelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
  teamId: _teamId,
  selectedPlayIds = [],
}) => {
  const [plays, setPlays] = useState<Play[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormation, setSelectedFormation] = useState<string>("");
  const [selectedPlayType, setSelectedPlayType] = useState<string>("");

  // Load plays when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPlays();
    }
  }, [isOpen]);

  const loadPlays = async () => {
    setLoading(true);
    try {
      // For now, we'll use a mock implementation since the real PlaysService might not have a getPlays method
      // In a real implementation, you'd call: const plays = await PlaysService.getPlays(teamId);
      const mockPlays: Play[] = [
        {
          id: "play-1",
          playbook_id: "pb-1",
          formation: "Shotgun",
          play_name: "Slant",
          p_type: "Pass",
          f_dir: "Right",
          p_dir: "Left",
          notes: "Quick slant to the outside receiver",
          confidence_base: 75,
          times_called: 12,
          times_successful: 8,
          created_by: "coach1",
          created_at: new Date("2024-01-15"),
          updated_at: new Date("2024-01-15"),
        },
        {
          id: "play-2",
          playbook_id: "pb-1",
          formation: "Pistol",
          play_name: "Zone Read",
          p_type: "Run",
          f_dir: "Left",
          notes: "Zone read with QB keeper option",
          confidence_base: 80,
          times_called: 8,
          times_successful: 6,
          created_by: "coach1",
          created_at: new Date("2024-01-16"),
          updated_at: new Date("2024-01-16"),
        },
        {
          id: "play-3",
          playbook_id: "pb-1",
          formation: "Shotgun",
          play_name: "Post Corner",
          p_type: "Pass",
          f_dir: "Trips Right",
          p_dir: "Right",
          notes: "Deep post-corner combination route",
          confidence_base: 70,
          times_called: 5,
          times_successful: 3,
          created_by: "coach1",
          created_at: new Date("2024-01-17"),
          updated_at: new Date("2024-01-17"),
        },
        {
          id: "play-4",
          playbook_id: "pb-1",
          formation: "Empty",
          play_name: "Screen",
          p_type: "Pass",
          f_dir: "Bunch Left",
          notes: "Quick screen to the running back",
          confidence_base: 85,
          times_called: 15,
          times_successful: 12,
          created_by: "coach1",
          created_at: new Date("2024-01-18"),
          updated_at: new Date("2024-01-18"),
        },
      ];

      setPlays(mockPlays);
    } catch (error) {
      console.error("Failed to load plays:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter plays based on search and filters
  const filteredPlays = useMemo(() => {
    return plays.filter((play) => {
      // Exclude already selected plays
      if (selectedPlayIds.includes(play.id)) {
        return false;
      }

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        play.play_name.toLowerCase().includes(searchLower) ||
        play.formation.toLowerCase().includes(searchLower) ||
        (play.notes && play.notes.toLowerCase().includes(searchLower));

      // Formation filter
      const matchesFormation =
        !selectedFormation || play.formation === selectedFormation;

      // Play type filter
      const matchesPlayType =
        !selectedPlayType || play.p_type === selectedPlayType;

      return matchesSearch && matchesFormation && matchesPlayType;
    });
  }, [
    plays,
    searchQuery,
    selectedFormation,
    selectedPlayType,
    selectedPlayIds,
  ]);

  // Get unique values for filters
  const formations = useMemo(() => {
    const unique = [...new Set(plays.map((p) => p.formation))];
    return unique.sort();
  }, [plays]);

  const playTypes = useMemo(() => {
    const unique = [...new Set(plays.map((p) => p.p_type))];
    return unique.sort();
  }, [plays]);

  const handlePlaySelect = (play: Play) => {
    onSelectPlay(play);
    onClose();
  };

  const getDisplayName = (play: Play) => {
    return `${play.formation}${play.f_dir ? ` ${play.f_dir}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`;
  };

  const getSuccessRate = (play: Play) => {
    if (play.times_called === 0) return 0;
    return Math.round((play.times_successful / play.times_called) * 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerContent={
        <Typography variant="headline-sm" as="h3" className="text-text-primary">
          Select Play for Practice Script
        </Typography>
      }
    >
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          <div>
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search plays by name, formation, or notes..."
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface-card text-text-primary"
            >
              <option value="">All Formations</option>
              {formations.map((formation) => (
                <option key={formation} value={formation}>
                  {formation}
                </option>
              ))}
            </select>

            <select
              value={selectedPlayType}
              onChange={(e) => setSelectedPlayType(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-surface-card text-text-primary"
            >
              <option value="">All Play Types</option>
              {playTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Play List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <Typography variant="body-sm" className="text-text-secondary">
                Loading plays...
              </Typography>
            </div>
          ) : filteredPlays.length === 0 ? (
            <div className="text-center py-8">
              <Icon
                name="file"
                className="h-12 w-12 text-text-muted mx-auto mb-4"
              />
              <Typography
                variant="headline-sm"
                className="text-text-secondary mb-2"
              >
                No plays found
              </Typography>
              <Typography variant="body-sm" className="text-text-muted">
                {searchQuery || selectedFormation || selectedPlayType
                  ? "Try adjusting your search or filters"
                  : "Add some plays to your playbook first"}
              </Typography>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPlays.map((play) => (
                <div
                  key={play.id}
                  className="border border-border rounded-lg p-4 hover:bg-surface-secondary cursor-pointer transition-colors"
                  onClick={() => handlePlaySelect(play)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body-sm"
                        className="text-text-primary font-medium mb-1"
                      >
                        {getDisplayName(play)}
                      </Typography>

                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="neutral" size="sm">
                          {play.p_type}
                        </Badge>
                        <Badge variant="info" size="sm">
                          {play.formation}
                        </Badge>
                        {play.times_called > 0 && (
                          <Badge
                            variant={
                              getSuccessRate(play) >= 70 ? "success" : "warning"
                            }
                            size="sm"
                          >
                            {getSuccessRate(play)}% success
                          </Badge>
                        )}
                      </div>

                      {play.notes && (
                        <Typography
                          variant="caption"
                          className="text-text-secondary line-clamp-2"
                        >
                          {play.notes}
                        </Typography>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button variant="primary" size="sm">
                        Add to Script
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Typography variant="caption" className="text-text-secondary">
            {filteredPlays.length} play{filteredPlays.length !== 1 ? "s" : ""}{" "}
            available
          </Typography>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};
