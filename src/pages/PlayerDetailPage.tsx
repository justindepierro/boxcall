import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card } from "../components/ui";
import { Icon } from "../components/ui/Icon/Icon";
import { Typography } from "../components/design-system";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { EmptyState } from "../components/ui/EmptyState";
import { rosterService } from "../services";
import type { RosterPlayerView } from "../services/rosterService";
import { useToast } from "../hooks/useToast";
import { info, error as logError } from "../utils/logger";
import EditPlayerModal from "../components/roster/EditPlayerModal";

/**
 * PlayerDetailPage - Detailed view of a single player
 *
 * Features:
 * - Full player profile with all information
 * - Edit mode with inline editing
 * - Breadcrumb navigation back to roster
 * - Stats placeholder for Phase 4
 */

// Loading skeleton state
const LoadingState: React.FC = () => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <Typography variant="headline-lg" className="text-primary mb-1">
          Loading Player...
        </Typography>
        <Typography variant="body" className="text-secondary">
          Please wait...
        </Typography>
      </header>
      <div className="space-y-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-lg"></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Error/not found state
const ErrorState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-secondary p-4 md:p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-6">
        <Typography variant="headline-lg" className="text-primary mb-1">
          Player Not Found
        </Typography>
        <Typography variant="body" className="text-secondary">
          The requested player could not be found
        </Typography>
      </header>
      <Button onClick={onBack}>
        <Icon name="chevron-left" className="w-4 h-4 mr-xs" />
        Back to Roster
      </Button>
    </div>
  </div>
);

// Player info cards grid
const PlayerInfoCards: React.FC<{
  player: RosterPlayerView;
  height: string;
  weight: string;
}> = ({ player, height, weight }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
    {/* Basic Information Card */}
    <Card>
      <div className="p-md">
        <Typography variant="headline-md" className="mb-md">
          Basic Information
        </Typography>
        <dl className="space-y-sm">
          <div>
            <dt className="text-secondary text-sm">Full Name</dt>
            <dd className="font-medium">
              {player.first_name} {player.last_name}
            </dd>
          </div>
          <div>
            <dt className="text-secondary text-sm">Position</dt>
            <dd className="font-medium">{player.position || "N/A"}</dd>
          </div>
          <div>
            <dt className="text-secondary text-sm">Jersey Number</dt>
            <dd className="font-medium">{player.jersey_number || "N/A"}</dd>
          </div>
          <div>
            <dt className="text-secondary text-sm">Grade Level</dt>
            <dd className="font-medium">{player.grade_level || "N/A"}</dd>
          </div>
          <div>
            <dt className="text-secondary text-sm">Status</dt>
            <dd>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  player.is_active
                    ? "bg-success-bg text-success-800"
                    : "bg-muted text-neutral-800"
                }`}
              >
                {player.roster_status ||
                  (player.is_active ? "Active" : "Inactive")}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </Card>

    {/* Physical Information Card */}
    <Card>
      <div className="p-md">
        <Typography variant="headline-md" className="mb-md">
          Physical Information
        </Typography>
        <dl className="space-y-sm">
          <div>
            <dt className="text-secondary text-sm">Height</dt>
            <dd className="font-medium">{height}</dd>
          </div>
          <div>
            <dt className="text-secondary text-sm">Weight</dt>
            <dd className="font-medium">{weight}</dd>
          </div>
        </dl>
      </div>
    </Card>

    {/* Additional Info Card */}
    <Card>
      <div className="p-md">
        <Typography variant="headline-md" className="mb-md">
          Additional Information
        </Typography>
        <Typography variant="body-sm" className="text-secondary">
          Additional player information and notes will be available soon.
        </Typography>
      </div>
    </Card>
  </div>
);

const PlayerDetailPage = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [player, setPlayer] = useState<RosterPlayerView | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const loadPlayer = async () => {
    if (!playerId) {
      toast.error("Invalid player ID");
      navigate("/roster");
      return;
    }

    try {
      setLoading(true);
      const playerData = await rosterService.getPlayerById(playerId);

      if (!playerData) {
        toast.error("Player not found");
        navigate("/roster");
        return;
      }

      setPlayer(playerData);
      info(
        `[PlayerDetailPage] Loaded player: ${playerData.first_name} ${playerData.last_name}`
      );
    } catch (error) {
      logError("[PlayerDetailPage] Failed to load player:", error);
      toast.error("Failed to load player information");
      navigate("/roster");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!player) {
    return <ErrorState onBack={() => navigate("/roster")} />;
  }

  const height = player.height_inches
    ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}"`
    : "N/A";

  const weight = player.weight_lbs ? `${player.weight_lbs} lbs` : "N/A";

  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            {`${player.first_name} ${player.last_name}`}
          </Typography>
          <Typography variant="body" className="text-secondary">
            {`#${player.jersey_number || "N/A"} • ${player.position || "No Position"}`}
          </Typography>
        </header>

        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            {
              id: "dashboard",
              label: "Dashboard",
              onClick: () => navigate("/dashboard"),
            },
            {
              id: "roster",
              label: "Roster",
              onClick: () => navigate("/roster"),
            },
            {
              id: "player",
              label: `${player.first_name} ${player.last_name}`,
              current: true,
            },
          ]}
          className="mb-4"
        />

        <div className="space-y-lg relative z-10">
          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/roster")}
              className="text-secondary"
            >
              <Icon name="chevron-left" className="w-4 h-4 mr-xs" />
              Back to Roster
            </Button>
            <Button onClick={() => setShowEditModal(true)}>
              <Icon name="edit" className="w-4 h-4 mr-xs" />
              Edit Player
            </Button>
          </div>

          {/* Player Profile Grid */}
          <PlayerInfoCards player={player} height={height} weight={weight} />

          {/* Statistics Placeholder (Phase 4) */}
          <Card>
            <div className="p-md">
              <Typography variant="headline-md" className="mb-md">
                Player Statistics
              </Typography>
              <EmptyState
                icon="info"
                title="Statistics Coming Soon"
                description="Player statistics and performance tracking will be available in Phase 4"
              />
            </div>
          </Card>
        </div>

        {/* Edit Player Modal */}
        {showEditModal && player && (
          <EditPlayerModal
            player={player}
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={async () => {
              await loadPlayer(); // Reload to show changes
              setShowEditModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

PlayerDetailPage.displayName = "PlayerDetailPage";

export default React.memo(PlayerDetailPage);
