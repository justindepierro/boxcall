import React, { useState, useRef, useEffect } from "react";
import { Card } from "../ui";
import { Typography } from "../design-system/Typography";
import {
  useSeasonStats,
  useLogGameResult,
  useGameResults,
} from "../../hooks/teamDataHooks";
import {
  Capability,
  getCapabilitiesForRole,
  hasCapability,
} from "../../services/capabilities/capabilityMap";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal/Modal";
import { useToast } from "../../hooks/useToast";
import { telemetry } from "../../lib/telemetry";

interface SeasonStatsCardProps {
  teamId: string;
  userRole?: string;
}

export const SeasonStatsCard: React.FC<SeasonStatsCardProps> = ({
  teamId,
  userRole,
}) => {
  const { data: stats, isLoading: statsLoading } = useSeasonStats(teamId);
  const { data: results = [] } = useGameResults(teamId);
  const { mutateAsync: logResult, isPending } = useLogGameResult(teamId);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [form, setForm] = useState({
    gameDate: "",
    opponent: "",
    site: "home",
    pointsFor: "",
    pointsAgainst: "",
    notes: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const caps = getCapabilitiesForRole(userRole);
  const canLog = hasCapability(caps, Capability.LOG_GAME_RESULT);
  const toast = useToast();

  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!form.gameDate) errs.push("Date required");
    if (!form.opponent) errs.push("Opponent required");
    if (form.pointsFor === "") errs.push("Points For required");
    if (form.pointsAgainst === "") errs.push("Points Against required");
    setErrors(errs);
    if (errs.length) return;
    try {
      await logResult({
        teamId,
        gameDate: form.gameDate,
        opponent: form.opponent,
        site: form.site,
        pointsFor: Number(form.pointsFor),
        pointsAgainst: Number(form.pointsAgainst),
        notes: form.notes || undefined,
      });
      if (results.length === 0) {
        telemetry.track("game_result.first", { teamId });
      }
      toast.success("Game result logged", "Season stats updated");
      setOpen(false);
      setForm({
        gameDate: "",
        opponent: "",
        site: "home",
        pointsFor: "",
        pointsAgainst: "",
        notes: "",
      });
      setErrors([]);
    } catch (e) {
      toast.error("Failed to log result", (e as Error).message);
    }
  }

  const winPct =
    stats?.win_pct != null ? (stats.win_pct * 100).toFixed(1) + "%" : "-";

  return (
    <Card className="bc-card-padding" aria-label="Season statistics">
      <div className="flex items-center justify-between mb-4">
        <Typography variant="headline-md" className="text-text-primary">
          Season Stats
        </Typography>
        {canLog && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setOpen(true)}
            ref={triggerRef}
          >
            Log Game
          </Button>
        )}
      </div>
      {statsLoading && (
        <div className="text-sm text-gray-500">Loading stats...</div>
      )}
      {!statsLoading && !stats && (
        <div className="text-sm text-gray-500">
          No stats yet – log your first game.
        </div>
      )}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              Wins
            </div>
            <div className="text-lg font-semibold">{stats.wins}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              Losses
            </div>
            <div className="text-lg font-semibold">{stats.losses}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              Win %
            </div>
            <div className="text-lg font-semibold">{winPct}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              PF
            </div>
            <div className="text-lg font-semibold">{stats.pf_total}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              PA
            </div>
            <div className="text-lg font-semibold">{stats.pa_total}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-secondary">
              GP
            </div>
            <div className="text-lg font-semibold">{stats.games_played}</div>
          </div>
        </div>
      )}
      {!!results.length && (
        <ul
          className="divide-y divide-gray-200 dark:divide-gray-700 text-sm"
          aria-label="Recent game results"
        >
          {results.slice(0, 5).map((r) => {
            const pf = r.points_for;
            const pa = r.points_against;
            const outcome = pf > pa ? "W" : pf < pa ? "L" : "T";
            const color =
              outcome === "W"
                ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200"
                : outcome === "L"
                  ? "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-200"
                  : "surface-subtle text-gray-800 dark:bg-gray-600 dark:text-gray-100";
            return (
              <li key={r.id} className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                  <span
                    className={`inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold ${color}`}
                  >
                    {outcome}
                  </span>
                  {pf}-{pa} vs {r.opponent}
                </span>
                <span className="text-gray-500 dark:text-gray-300">
                  {new Date(r.game_date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      {open && (
        <Modal
          isOpen={open}
          onClose={() => setOpen(false)}
          title="Log Game Result"
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {!!errors.length && (
              <div className="rounded border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
                <ul className="list-disc list-inside space-y-0.5">
                  {errors.map((er) => (
                    <li key={er}>{er}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 bc-grid-gap">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="gr-date"
                >
                  Date
                </label>
                <Input
                  id="gr-date"
                  type="date"
                  required
                  value={form.gameDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, gameDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="gr-site"
                >
                  Site
                </label>
                <Select
                  id="gr-site"
                  value={form.site}
                  onChange={(v) => setForm((f) => ({ ...f, site: String(v) }))}
                  options={[
                    { value: "home", label: "Home" },
                    { value: "away", label: "Away" },
                    { value: "neutral", label: "Neutral" },
                  ]}
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="gr-opponent"
              >
                Opponent
              </label>
              <Input
                id="gr-opponent"
                required
                value={form.opponent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, opponent: e.target.value }))
                }
                placeholder="Central HS"
              />
            </div>
            <div className="grid grid-cols-2 bc-grid-gap">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="gr-pf"
                >
                  Points For
                </label>
                <Input
                  id="gr-pf"
                  type="number"
                  min="0"
                  required
                  value={form.pointsFor}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, pointsFor: e.target.value }))
                  }
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="gr-pa"
                >
                  Points Against
                </label>
                <Input
                  id="gr-pa"
                  type="number"
                  min="0"
                  required
                  value={form.pointsAgainst}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setForm((f) => ({ ...f, pointsAgainst: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="gr-notes"
              >
                Notes (optional)
              </label>
              <Input
                id="gr-notes"
                value={form.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Overtime thriller"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending}>
                {isPending ? "Logging..." : "Log Result"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
