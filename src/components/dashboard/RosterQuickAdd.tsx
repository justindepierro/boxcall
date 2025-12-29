import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { Card, Button, FormSelect } from "../ui";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { rosterService } from "../../services";
import type { RosterPlayerView } from "../../services/rosterService";
import { getActiveTeamId } from "../../utils/activeTeam";
import { logError } from "../../utils/logger";

type QuickAddData = {
  firstName: string;
  lastName: string;
  position: string;
  jerseyNumber: string;
  heightFeet: string;
  heightInches: string;
};

const createEmptyQuickAddData = (): QuickAddData => ({
  firstName: "",
  lastName: "",
  position: "",
  jerseyNumber: "",
  heightFeet: "",
  heightInches: "",
});

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseHeightInches(
  heightFeet: string,
  heightInches: string
): { heightInches?: number; error?: string } {
  if (!heightFeet.trim() && !heightInches.trim()) return {};

  const feet = parseInt(heightFeet.trim() || "0", 10) || 0;
  const inches = parseInt(heightInches.trim() || "0", 10) || 0;

  if (feet < 0 || inches < 0 || inches > 11) {
    return { error: "Invalid height format. Inches must be 0-11." };
  }

  return { heightInches: feet * 12 + inches };
}

function validateQuickAddData(data: QuickAddData): string | null {
  if (!data.firstName.trim() || !data.lastName.trim() || !data.position) {
    return "First name, last name, and position are required";
  }
  return null;
}

const RosterQuickAddLoading: React.FC = () => (
  <Card className="p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded-lg w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded-lg"></div>
        <div className="h-3 bg-muted rounded-lg w-5/6"></div>
      </div>
    </div>
  </Card>
);

const RosterQuickAddHeader: React.FC<{ totalCount: number }> = ({
  totalCount,
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-2">
      <Icon name="users" className="h-5 w-5 text-info" />
      <Typography variant="headline-sm" className="text-primary">
        Team Roster
      </Typography>
    </div>
    <Typography variant="body-sm" className="text-secondary">
      {totalCount} players
    </Typography>
  </div>
);

const RosterQuickAddRecentPlayers: React.FC<{
  players: RosterPlayerView[];
}> = ({ players }) => {
  if (players.length === 0) {
    return (
      <div className="text-center py-4 mb-4">
        <Typography variant="body-sm" className="text-secondary">
          No players added yet
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-2 mb-4">
      <Typography variant="body-sm" className="text-secondary mb-2">
        Recent additions:
      </Typography>
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center space-x-3 p-2 bg-subtle rounded-lg"
        >
          <div className="w-8 h-8 bg-info/20 rounded-full flex items-center justify-center">
            <Typography variant="body-sm" className="text-info font-medium">
              {player.jersey_number || "?"}
            </Typography>
          </div>
          <div className="flex-1">
            <Typography variant="body-sm" className="text-primary">
              Player {player.id.slice(0, 8)}
            </Typography>
            <Typography variant="caption" className="text-secondary">
              {player.position || "Position TBD"}
            </Typography>
          </div>
        </div>
      ))}
    </div>
  );
};

const RosterQuickAddActions: React.FC<{
  onQuickAdd: () => void;
  onManageRoster: () => void;
}> = ({ onQuickAdd, onManageRoster }) => (
  <div className="space-y-2">
    <Button variant="primary" size="sm" className="w-full" onClick={onQuickAdd}>
      <Icon name="plus" className="h-4 w-4 mr-2" />
      Quick Add Player
    </Button>
    <Button
      variant="ghost"
      size="sm"
      className="w-full"
      onClick={onManageRoster}
    >
      <Icon name="settings" className="h-4 w-4 mr-2" />
      Manage Full Roster
    </Button>
  </div>
);

const RosterQuickAddForm: React.FC<{
  data: QuickAddData;
  setData: React.Dispatch<React.SetStateAction<QuickAddData>>;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}> = ({ data, setData, saving, error, onCancel, onSubmit }) => (
  <div className="space-y-3">
    <Typography variant="body-sm" className="text-secondary mb-3">
      Add a new player quickly:
    </Typography>

    {error && (
      <div className="p-2 bg-error-bg border border-error-200 rounded-lg text-sm text-error-600">
        {error}
      </div>
    )}

    <div className="grid grid-cols-2 gap-2">
      <input
        type="text"
        placeholder="First Name"
        value={data.firstName}
        onChange={(e) =>
          setData((prev) => ({
            ...prev,
            firstName: e.target.value,
          }))
        }
        className="px-2 py-1 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-text-info"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={data.lastName}
        onChange={(e) =>
          setData((prev) => ({
            ...prev,
            lastName: e.target.value,
          }))
        }
        className="px-2 py-1 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-text-info"
      />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <FormSelect
        value={data.position}
        onChange={(value) =>
          setData((prev) => ({
            ...prev,
            position: value,
          }))
        }
        placeholder="Position"
        options={[
          { value: "QB", label: "QB" },
          { value: "RB", label: "RB" },
          { value: "WR", label: "WR" },
          { value: "TE", label: "TE" },
          { value: "OL", label: "OL" },
          { value: "DL", label: "DL" },
          { value: "LB", label: "LB" },
          { value: "DB", label: "DB" },
          { value: "K", label: "K" },
          { value: "P", label: "P" },
        ]}
      />
      <input
        type="number"
        placeholder="Jersey #"
        min="0"
        max="99"
        value={data.jerseyNumber}
        onChange={(e) =>
          setData((prev) => ({
            ...prev,
            jerseyNumber: e.target.value,
          }))
        }
        className="px-2 py-1 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-text-info"
      />
    </div>

    <div className="grid grid-cols-2 gap-2">
      <div className="flex space-x-1">
        <input
          type="number"
          placeholder="Ft"
          min="4"
          max="8"
          value={data.heightFeet}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              heightFeet: e.target.value,
            }))
          }
          className="flex-1 px-2 py-1 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-text-info"
        />
        <span className="flex items-center text-sm text-secondary">ft</span>
      </div>
      <div className="flex space-x-1">
        <input
          type="number"
          placeholder="In"
          min="0"
          max="11"
          value={data.heightInches}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              heightInches: e.target.value,
            }))
          }
          className="flex-1 px-2 py-1 text-sm border border-secondary rounded-lg focus:outline-none focus:ring-1 focus:ring-text-info"
        />
        <span className="flex items-center text-sm text-secondary">in</span>
      </div>
    </div>

    <div className="flex space-x-2 pt-2">
      <Button variant="ghost" size="sm" className="flex-1" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="sm"
        className="flex-1"
        onClick={onSubmit}
        disabled={!data.firstName || !data.lastName || !data.position || saving}
      >
        {saving ? "Adding..." : "Add"}
      </Button>
    </div>
  </div>
);

/**
 * RosterQuickAdd - Dashboard widget for quick roster management
 *
 * Features:
 * - Display recent roster additions
 * - Quick add single player
 * - Navigate to full roster management
 * - Show roster count and status
 */
export const RosterQuickAdd: React.FC = () => {
  const navigate = useNavigate();
  const [recentPlayers, setRecentPlayers] = useState<RosterPlayerView[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickAddData, setQuickAddData] = useState<QuickAddData>(
    createEmptyQuickAddData
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teamId = getActiveTeamId();

  const loadRosterData = useCallback(async () => {
    try {
      setLoading(true);
      const roster = await rosterService.listByTeam(teamId);
      setTotalCount(roster.length);
      // Get 3 most recent players
      setRecentPlayers(roster.slice(-3).reverse());
    } catch (error) {
      logError("Failed to load roster data:", error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadRosterData();
  }, [loadRosterData]);

  const handleQuickAdd = async () => {
    const validationError = validateQuickAddData(quickAddData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const jerseyNumber = parseOptionalInt(quickAddData.jerseyNumber);

      const { heightInches, error: heightError } = parseHeightInches(
        quickAddData.heightFeet,
        quickAddData.heightInches
      );
      if (heightError) {
        setError(heightError);
        return;
      }

      const playerData = {
        team_id: teamId,
        first_name: quickAddData.firstName.trim(),
        last_name: quickAddData.lastName.trim(),
        position: quickAddData.position, // Match database field name
        jersey_number: jerseyNumber,
        height_inches: heightInches,
      };

      await rosterService.createPlayer(playerData);

      // Reset form and close
      setQuickAddData(createEmptyQuickAddData());
      setShowQuickAdd(false);
      setError(null);

      // Refresh data
      await loadRosterData();
    } catch (error) {
      logError("Failed to add player:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add player. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleManageRoster = () => {
    navigate("/roster");
  };

  if (loading) {
    return <RosterQuickAddLoading />;
  }

  return (
    <Card className="p-6">
      <RosterQuickAddHeader totalCount={totalCount} />

      {!showQuickAdd ? (
        <>
          <RosterQuickAddRecentPlayers players={recentPlayers} />
          <RosterQuickAddActions
            onQuickAdd={() => setShowQuickAdd(true)}
            onManageRoster={handleManageRoster}
          />
        </>
      ) : (
        <RosterQuickAddForm
          data={quickAddData}
          setData={setQuickAddData}
          saving={saving}
          error={error}
          onCancel={() => {
            setShowQuickAdd(false);
            setError(null);
          }}
          onSubmit={handleQuickAdd}
        />
      )}
    </Card>
  );
};
