import React from "react";
import { Button } from "../../../components/ui/Button/Button";
import { Icon } from "../../../components/ui/Icon/Icon";
import { Typography } from "../../../components/design-system";

interface RosterToolbarProps {
  totalPlayers: number;
  activePlayerCount: number;
  filteredCount: number;
  selectedCount: number;
  hasSelection: boolean;
  onAddPlayer: () => void;
  onImport: () => void;
  onExport: () => void;
  onBulkStatusChange: () => void;
  onBulkEdit: () => void;
  onClearSelection: () => void;
}

export const RosterToolbar: React.FC<RosterToolbarProps> = ({
  totalPlayers,
  activePlayerCount,
  filteredCount,
  selectedCount,
  hasSelection,
  onAddPlayer,
  onImport,
  onExport,
  onBulkStatusChange,
  onBulkEdit,
  onClearSelection,
}) => {
  return (
    <div className="bg-primary border-b border-border p-6">
      {/* Player Count and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Typography variant="body-sm" className="text-secondary">
            {filteredCount !== totalPlayers ? (
              <>
                Showing <strong>{filteredCount}</strong> of{" "}
                <strong>{totalPlayers}</strong> players •{" "}
                <strong>{activePlayerCount}</strong> active
              </>
            ) : (
              <>
                <strong>{totalPlayers}</strong>{" "}
                {totalPlayers === 1 ? "player" : "players"} •{" "}
                <strong>{activePlayerCount}</strong> active
              </>
            )}
          </Typography>
        </div>

        <div className="flex items-center gap-2">
          {hasSelection ? (
            <>
              <Typography variant="body-sm" className="text-secondary mr-2">
                <strong>{selectedCount}</strong> selected
              </Typography>
              <Button variant="outline" size="sm" onClick={onBulkStatusChange}>
                <Icon name="edit" className="w-4 h-4 mr-xs" />
                Change Status
              </Button>
              <Button variant="outline" size="sm" onClick={onBulkEdit}>
                <Icon name="edit" className="w-4 h-4 mr-xs" />
                Bulk Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onClearSelection}>
                <Icon name="close" className="w-4 h-4 mr-xs" />
                Clear
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Icon name="download" className="w-4 h-4 mr-xs" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onImport}>
                <Icon name="upload" className="w-4 h-4 mr-xs" />
                Import
              </Button>
              <Button variant="primary" size="sm" onClick={onAddPlayer}>
                <Icon name="plus" className="w-4 h-4 mr-xs" />
                Add Player
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
