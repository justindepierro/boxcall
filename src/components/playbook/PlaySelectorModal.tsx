import React, { useState, useMemo } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import { Badge } from "../ui/Badge";
import type { Play } from "../../types/play";
import { useTeamsData } from "../../hooks/useTeamsData";

// DatabasePlay type from useTeamsData (matches what the hook returns)
type DatabasePlay = Exclude<
  ReturnType<typeof useTeamsData>["plays"],
  undefined
>[number];

interface PlaySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlay: (play: Play) => void;
  selectedPlayIds?: string[]; // For excluding already selected plays
  title?: string; // Custom title for the modal
}

export const PlaySelectorModal: React.FC<PlaySelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPlay,
  selectedPlayIds = [],
  title = "Select Play",
}) => {
  // Get real plays from database
  const { plays, loading } = useTeamsData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormation, setSelectedFormation] = useState<string>("");
  const [selectedPlayType, setSelectedPlayType] = useState<string>("");
  const [selectedPersonnel, setSelectedPersonnel] = useState<string>("");

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

      // Personnel filter
      const matchesPersonnel =
        !selectedPersonnel || play.personnel === selectedPersonnel;

      return matchesSearch && matchesFormation && matchesPlayType && matchesPersonnel;
    });
  }, [
    plays,
    searchQuery,
    selectedFormation,
    selectedPlayType,
    selectedPersonnel,
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

  const personnelGroups = useMemo(() => {
    const unique = [...new Set(plays.map((p) => p.personnel).filter(Boolean))];
    return unique.sort();
  }, [plays]);

  const handlePlaySelect = (play: DatabasePlay) => {
    // Convert DatabasePlay to Play for the callback (both types are compatible for the consumer)
    onSelectPlay(play as unknown as Play);
    onClose();
  };

  const getDisplayName = (play: DatabasePlay) => {
    return `${play.formation}${play.f_dir ? ` ${play.f_dir}` : ""} - ${play.play_name}${play.p_dir ? ` (${play.p_dir})` : ""}`;
  };

  const getSuccessRate = (play: DatabasePlay) => {
    if (!play.times_called || play.times_called === 0) return 0;
    return Math.round(((play.times_successful || 0) / play.times_called) * 100);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      headerContent={
        <Typography variant="headline-sm" as="h3" className="text-primary">
          {title}
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
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-primary text-primary"
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
              className="px-3 py-2 border border-border rounded-lg text-sm bg-primary text-primary"
            >
              <option value="">All Play Types</option>
              {playTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={selectedPersonnel}
              onChange={(e) => setSelectedPersonnel(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-sm bg-primary text-primary"
            >
              <option value="">All Personnel</option>
              {personnelGroups.map((personnel) => (
                <option key={personnel} value={personnel}>
                  {personnel}
                </option>
              ))}
            </select>
          </div><option key={type} value={type}>
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
              <Typography variant="body-sm" className="text-secondary">
                Loading plays...
              </Typography>
            </div>
          ) : filteredPlays.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="file" className="h-12 w-12 text-muted mx-auto mb-4" />
              <Typography variant="headline-sm" className="text-secondary mb-2">
                No plays found
              </Typography>
              <Typography variant="body-sm" className="text-muted">
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
                  className="border border-border rounded-lg p-4 hover:bg-secondary cursor-pointer transition-colors"
                  onClick={() => handlePlaySelect(play)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body-sm"
                        className="text-primary font-medium mb-1"
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
                        {play.times_called !== undefined &&
                          play.times_called > 0 && (
                            <Badge
                              variant={
                                getSuccessRate(play) >= 70
                                  ? "success"
                                  : "warning"
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
                          className="text-secondary line-clamp-2"
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
          <Typography variant="caption" className="text-secondary">
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
