/**
 * PlayExecutionForm - Form for logging play results
 */

import React from "react";
import { Typography } from "../../design-system";
import { FormSelect } from "../../ui";
import { Icon } from "../../ui/Icon/Icon";
import type { PlayExecutionFormProps } from "./types";
import { QUICK_TAGS, RESULT_OPTIONS, COVERAGE_OPTIONS } from "./types";
import type { ExecutionResult, OpponentCoverage } from "../../../types/session";

export const PlayExecutionForm: React.FC<PlayExecutionFormProps> = ({
  form,
  onFormChange,
  onTagToggle,
  onSubmit,
  isPaused,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
      <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-amber-500/25">
          <Icon name="clipboard-check" size="sm" className="text-white" />
        </div>
        Log Play Result
      </h3>

      <div className="space-y-4">
        {/* Result & Yards */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-2">
              <Typography variant="body-sm" className="text-secondary">
                Result
              </Typography>
            </label>
            <FormSelect
              value={form.result}
              onChange={(value) =>
                onFormChange({ result: value as ExecutionResult })
              }
              disabled={isPaused}
              options={RESULT_OPTIONS}
            />
          </div>

          <div>
            <label className="block mb-2">
              <Typography variant="body-sm" className="text-secondary">
                Yards Gained
              </Typography>
            </label>
            <input
              type="number"
              value={form.yardsGained}
              onChange={(e) => onFormChange({ yardsGained: e.target.value })}
              placeholder="0"
              disabled={isPaused}
              className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Special Outcomes */}
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.wasTouchdown}
              onChange={(e) => onFormChange({ wasTouchdown: e.target.checked })}
              disabled={isPaused}
              className="w-4 h-4 rounded border-border text-success focus:ring-success"
            />
            <Typography variant="body-sm">Touchdown</Typography>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.wasTurnover}
              onChange={(e) => onFormChange({ wasTurnover: e.target.checked })}
              disabled={isPaused}
              className="w-4 h-4 rounded border-border text-error focus:ring-error"
            />
            <Typography variant="body-sm">Turnover</Typography>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.wasPenalty}
              onChange={(e) => onFormChange({ wasPenalty: e.target.checked })}
              disabled={isPaused}
              className="w-4 h-4 rounded border-border text-warning focus:ring-warning"
            />
            <Typography variant="body-sm">Penalty</Typography>
          </label>
        </div>

        {form.wasPenalty && (
          <div>
            <label className="block mb-2">
              <Typography variant="body-sm" className="text-secondary">
                Penalty Yards
              </Typography>
            </label>
            <input
              type="number"
              value={form.penaltyYards}
              onChange={(e) => onFormChange({ penaltyYards: e.target.value })}
              placeholder="0"
              disabled={isPaused}
              className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        {/* Opponent Coverage - Phase 13.2 */}
        <div>
          <label className="block mb-2">
            <Typography variant="body-sm" className="text-secondary">
              Opponent Coverage
            </Typography>
          </label>
          <FormSelect
            value={form.opponentCoverage}
            onChange={(value) =>
              onFormChange({ opponentCoverage: value as OpponentCoverage })
            }
            disabled={isPaused}
            options={COVERAGE_OPTIONS}
          />
          <Typography variant="body-xs" className="text-tertiary mt-1">
            What defense did they show?
          </Typography>
        </div>

        {/* Quick Tags - Phase 12.1 */}
        <div>
          <label className="block mb-2">
            <Typography variant="body-sm" className="text-secondary">
              Quick Tags (Optional)
            </Typography>
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TAGS.map((tag) => {
              const isSelected = form.quickTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onTagToggle(tag.id)}
                  disabled={isPaused}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    border transition-all
                    ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-primary border-border text-secondary hover:border-primary/50"
                    }
                    ${isPaused ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block mb-2">
            <Typography variant="body-sm" className="text-secondary">
              Notes (Optional)
            </Typography>
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => onFormChange({ notes: e.target.value })}
            placeholder="Add notes about this play..."
            disabled={isPaused}
            className="w-full px-3 py-2 border border-border rounded-lg bg-primary text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            rows={2}
          />
        </div>

        {/* Submit Button - Premium */}
        <button
          onClick={onSubmit}
          disabled={isPaused || !form.yardsGained}
          className={`
            w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all
            ${
              isPaused || !form.yardsGained
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 active:scale-[0.98]"
            }
          `}
        >
          <Icon name="check" size="md" />
          Log Play
        </button>
      </div>
    </div>
  );
};
