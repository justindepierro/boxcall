import React, { useState, useRef, useEffect } from "react";

import {
  useSeasonStats,
  useLogGameResult,
  useGameResults,
} from "../../hooks/teamDataHooks";
import { useToast } from "../../hooks/useToast";
import { telemetry } from "../../lib/telemetry";
import {
  CAPABILITIES,
  getCapabilitiesForRole,
  hasCapability,
} from "@services/capabilities/capabilityMap";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal/Modal";
import { Dropdown } from "../ui/Dropdown";
import { Icon } from "../ui/Icon/Icon";

interface SeasonStatsCardProps {
  teamId: string;
  userRole?: string;
  compact?: boolean;
  onClick?: () => void;
}

type GameResultFormState = {
  gameDate: string;
  opponent: string;
  site: string;
  pointsFor: string;
  pointsAgainst: string;
  notes: string;
};

const createEmptyForm = (): GameResultFormState => ({
  gameDate: "",
  opponent: "",
  site: "home",
  pointsFor: "",
  pointsAgainst: "",
  notes: "",
});

const validateGameResultForm = (form: GameResultFormState): string[] => {
  const errs: string[] = [];
  if (!form.gameDate) errs.push("Date required");
  if (!form.opponent) errs.push("Opponent required");
  if (form.pointsFor === "") errs.push("Points For required");
  if (form.pointsAgainst === "") errs.push("Points Against required");
  return errs;
};

const getOutcome = (pointsFor: number, pointsAgainst: number) => {
  if (pointsFor > pointsAgainst) return "W";
  if (pointsFor < pointsAgainst) return "L";
  return "T";
};

const getOutcomeClasses = (outcome: string) => {
  if (outcome === "W") return "bg-success/20 text-success";
  if (outcome === "L") return "bg-surface-error text-error";
  return "bg-subtle text-primary";
};

const formatResultDate = (gameDate: string) =>
  new Date(gameDate).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const SeasonStatsCompactCard: React.FC<{
  stats: any;
  onClick?: () => void;
}> = ({ stats, onClick }) => (
  <div
    className="h-full flex flex-col items-center justify-center text-center cursor-pointer hover:scale-105 transition-transform duration-200"
    onClick={onClick}
  >
    <div className="w-16 h-16 bg-aurora-violet rounded-2xl flex items-center justify-center mb-3 shadow-lg">
      <Icon name="trending-up" size="xl" className="text-purple-600" />
    </div>
    <Typography variant="label-md" className="text-primary font-medium mb-1">
      Season Stats
    </Typography>
    <Typography variant="caption" color="muted" className="text-xs">
      {stats ? `${stats.wins}-${stats.losses}` : "0-0"}
    </Typography>
  </div>
);

const SeasonStatsSummary: React.FC<{ stats: any }> = ({ stats }) => {
  const winPct =
    stats?.win_pct != null ? `${(stats.win_pct * 100).toFixed(1)}%` : "-";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center mb-4">
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          Wins
        </Typography>
        <div className="text-lg font-semibold">{stats.wins}</div>
      </div>
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          Losses
        </Typography>
        <div className="text-lg font-semibold">{stats.losses}</div>
      </div>
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          Win %
        </Typography>
        <div className="text-lg font-semibold">{winPct}</div>
      </div>
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          PF
        </Typography>
        <div className="text-lg font-semibold">{stats.points_for}</div>
      </div>
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          PA
        </Typography>
        <div className="text-lg font-semibold">{stats.points_against}</div>
      </div>
      <div>
        <Typography variant="label-md" as="div" className="text-secondary">
          GP
        </Typography>
        <div className="text-lg font-semibold">{stats.games_played}</div>
      </div>
    </div>
  );
};

const RecentResultsList: React.FC<{ results: any[] }> = ({ results }) => {
  if (!results.length) return null;

  return (
    <ul
      className="divide-y divide-border text-sm"
      aria-label="Recent game results"
    >
      {results.slice(0, 5).map((r) => {
        const pf = r.our_score ?? 0;
        const pa = r.opponent_score ?? 0;
        const outcome = getOutcome(pf, pa);
        const color = getOutcomeClasses(outcome);

        return (
          <li key={r.id} className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 font-medium text-primary">
              <span
                className={`inline-flex items-center justify-center rounded-lg px-1.5 py-0.5 text-xs font-semibold ${color}`}
              >
                {outcome}
              </span>
              {pf}-{pa} vs {r.opponent}
            </span>
            <span className="text-muted">{formatResultDate(r.game_date)}</span>
          </li>
        );
      })}
    </ul>
  );
};

const LogGameResultModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  errors: string[];
  form: GameResultFormState;
  setForm: React.Dispatch<React.SetStateAction<GameResultFormState>>;
}> = ({ open, onClose, onSubmit, isPending, errors, form, setForm }) => {
  if (!open) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="Log Game Result">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {!!errors.length && (
          <div className="rounded border border-error bg-surface-error p-3 text-sm text-error">
            <ul className="list-disc list-inside space-y-0.5">
              {errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 bc-grid-gap">
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium mb-1"
              htmlFor="gr-date"
            >
              Date
            </Typography>
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
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium mb-1"
              htmlFor="gr-site"
            >
              Site
            </Typography>
            <Dropdown
              id="gr-site"
              value={form.site}
              onChange={(v) => setForm((f) => ({ ...f, site: v }))}
              options={[
                { value: "home", label: "Home" },
                { value: "away", label: "Away" },
                { value: "neutral", label: "Neutral" },
              ]}
            />
          </div>
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-1"
            htmlFor="gr-opponent"
          >
            Opponent
          </Typography>
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
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium mb-1"
              htmlFor="gr-pf"
            >
              Points For
            </Typography>
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
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium mb-1"
              htmlFor="gr-pa"
            >
              Points Against
            </Typography>
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
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-1"
            htmlFor="gr-notes"
          >
            Notes (optional)
          </Typography>
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
            onClick={onClose}
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
  );
};

export const SeasonStatsCard: React.FC<SeasonStatsCardProps> = ({
  teamId,
  userRole,
  compact = false,
  onClick,
}) => {
  const { data: stats, isLoading: statsLoading } = useSeasonStats(teamId);
  const { data: results = [] } = useGameResults(teamId);
  const { mutateAsync: logResult, isPending } = useLogGameResult(teamId);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [form, setForm] = useState<GameResultFormState>(createEmptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const caps = getCapabilitiesForRole(userRole);
  const canLog = hasCapability(caps, CAPABILITIES.LOG_GAME_RESULT);
  const toast = useToast();

  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateGameResultForm(form);
    setErrors(errs);
    if (errs.length) return;
    try {
      await logResult({
        teamId,
        gameDate: form.gameDate,
        opponent: form.opponent,
        homeAway: form.site === "away" ? "away" : "home",
        pointsFor: Number(form.pointsFor),
        pointsAgainst: Number(form.pointsAgainst),
        notes: form.notes || undefined,
      });
      if (results.length === 0) {
        telemetry.track("game_result.first", { teamId });
      }
      toast.success("Game result logged", "Season stats updated");
      setOpen(false);
      setForm(createEmptyForm());
      setErrors([]);
    } catch (e) {
      toast.error("Failed to log result", (e as Error).message);
    }
  }

  return (
    <div className="h-full flex flex-col" aria-label="Season statistics">
      {compact ? (
        <SeasonStatsCompactCard stats={stats} onClick={onClick} />
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <Typography variant="headline-md" className="text-primary">
              Season Stats
            </Typography>
          </div>
          {statsLoading && (
            <div className="text-sm text-muted">Loading stats...</div>
          )}
          {!statsLoading && !stats && (
            <div className="text-sm text-muted">
              No stats yet – log your first game.
            </div>
          )}
          {stats && <SeasonStatsSummary stats={stats} />}
          <RecentResultsList results={results} />

          {/* Action Button */}
          {canLog && (
            <div className="card-actions mt-auto pt-3">
              <Button
                variant="primary"
                onClick={() => setOpen(true)}
                ref={triggerRef}
                className="w-full"
              >
                Log Game
              </Button>
            </div>
          )}
        </>
      )}

      <LogGameResultModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        isPending={isPending}
        errors={errors}
        form={form}
        setForm={setForm}
      />
    </div>
  );
};
