import { useCallback, useMemo, useState } from "react";
import { Typography } from "../../design-system/Typography";
import { Button } from "../../ui/Button/Button";
import { Icon } from "../../ui/Icon";
import type { PracticeScriptPlay } from "@services";

type HashMark = "left" | "middle" | "right";
type FieldPosition = "plus_territory" | "red_zone" | "backed_up" | "midfield";

type DefensiveFront =
  | "base"
  | "4-3"
  | "3-4"
  | "nickel"
  | "dime"
  | "bear"
  | "tite"
  | string;

type Coverage =
  | "cover_0"
  | "cover_1"
  | "cover_2"
  | "cover_3"
  | "cover_4"
  | "cover_6"
  | "quarters"
  | "man"
  | string;

type Blitz =
  | "none"
  | "edge"
  | "a_gap"
  | "b_gap"
  | "sim_pressure"
  | "zone_blitz"
  | "all_out"
  | string;

type Scenario = {
  hash: HashMark;
  downDistance: string;
  fieldPosition: FieldPosition;
  defensiveFront: DefensiveFront;
  coverage: Coverage;
  blitz: Blitz;
};

type ScenarioField = keyof Scenario;

type CustomField = "defensiveFront" | "coverage" | "blitz";

type ScenarioCustomState = {
  defensiveFront: { value: string; isOpen: boolean };
  coverage: { value: string; isOpen: boolean };
  blitz: { value: string; isOpen: boolean };
};

const FRONT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "base", label: "Base Defense" },
  { value: "4-3", label: "4-3 Front" },
  { value: "3-4", label: "3-4 Front" },
  { value: "nickel", label: "Nickel" },
  { value: "dime", label: "Dime" },
  { value: "bear", label: "Bear Front" },
  { value: "tite", label: "Tite Front" },
];

const COVERAGE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "cover_2", label: "Cover 2" },
  { value: "cover_3", label: "Cover 3" },
  { value: "cover_4", label: "Cover 4 / Quarters" },
  { value: "cover_6", label: "Cover 6" },
  { value: "cover_1", label: "Cover 1 / Man-Free" },
  { value: "cover_0", label: "Cover 0 / Blitz" },
  { value: "man", label: "Man Coverage" },
  { value: "quarters", label: "Pure Quarters" },
];

const BLITZ_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "none", label: "No Blitz" },
  { value: "edge", label: "Edge Blitz" },
  { value: "a_gap", label: "A-Gap Blitz" },
  { value: "b_gap", label: "B-Gap Blitz" },
  { value: "sim_pressure", label: "Sim Pressure" },
  { value: "zone_blitz", label: "Zone Blitz" },
  { value: "all_out", label: "All-Out Blitz" },
];

function clampRepetitions(value: number): number {
  return Math.max(1, Math.min(20, value));
}

function updateScenario(
  base: Scenario,
  field: ScenarioField,
  value: Scenario[ScenarioField]
): Scenario {
  return { ...base, [field]: value } as Scenario;
}

function getInitialScenario(scriptPlay: PracticeScriptPlay): Scenario {
  return {
    hash: (scriptPlay.hash as HashMark) || "middle",
    downDistance: scriptPlay.downDistance || "1st & 10",
    fieldPosition:
      (scriptPlay.fieldPosition as FieldPosition) || "plus_territory",
    defensiveFront: (scriptPlay.defensiveFront as DefensiveFront) || "base",
    coverage: (scriptPlay.coverage as Coverage) || "cover_2",
    blitz: (scriptPlay.blitz as Blitz) || "none",
  };
}

function CustomSelectField({
  label,
  value,
  options,
  custom,
  onChange,
  onOpenCustom,
  onCommitCustom,
  onCloseCustom,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  custom: { value: string; isOpen: boolean };
  onChange: (value: string) => void;
  onOpenCustom: () => void;
  onCommitCustom: (value: string) => void;
  onCloseCustom: () => void;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <Typography variant="caption" className="text-secondary font-medium">
        {label}
      </Typography>
      {!custom.isOpen ? (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === "custom") {
              onOpenCustom();
              return;
            }
            onChange(e.target.value);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          <option value="custom">➕ Custom...</option>
        </select>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={custom.value}
            onChange={(e) => onCommitCustom(e.target.value)}
            onBlur={() => {
              if (custom.value.trim()) {
                onChange(custom.value.trim());
                onCloseCustom();
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.value.trim()) {
                onChange(custom.value.trim());
                onCloseCustom();
              } else if (e.key === "Escape") {
                onCloseCustom();
              }
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1"
            placeholder={`Custom ${label.toLowerCase()}...`}
            autoFocus
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseCustom}
            aria-label={`Cancel custom ${label.toLowerCase()}`}
          >
            <Icon name="close" size="sm" />
          </Button>
        </div>
      )}
    </div>
  );
}

function RepetitionsSection({
  repetitionsValue,
  onChange,
}: {
  repetitionsValue: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="mb-4">
      <Typography
        variant="caption"
        className="text-secondary font-medium mb-2 block"
      >
        Repetitions
      </Typography>
      <div className="flex items-center space-x-2 max-w-xs">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(repetitionsValue - 1)}
          disabled={repetitionsValue <= 1}
          className="h-10 w-10 p-0 rounded-lg border border-border hover:bg-subtle"
          aria-label="Decrease repetitions"
        >
          <Icon name="minus" className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-center">
          <Typography variant="body-lg" className="font-bold text-primary">
            {repetitionsValue}
          </Typography>
          <Typography variant="caption" className="text-muted">
            reps
          </Typography>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(repetitionsValue + 1)}
          disabled={repetitionsValue >= 20}
          className="h-10 w-10 p-0 rounded-lg border border-border hover:bg-subtle"
          aria-label="Increase repetitions"
        >
          <Icon name="plus" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ScenarioGrid({
  scenario,
  custom,
  onScenarioChange,
  onOpenCustom,
  onCloseCustom,
  onSetCustomValue,
}: {
  scenario: Scenario;
  custom: ScenarioCustomState;
  onScenarioChange: (
    field: ScenarioField,
    value: Scenario[ScenarioField]
  ) => void;
  onOpenCustom: (field: CustomField) => void;
  onCloseCustom: (field: CustomField) => void;
  onSetCustomValue: (field: CustomField, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Hash */}
      <div className="flex flex-col space-y-2">
        <Typography variant="caption" className="text-secondary font-medium">
          Hash Mark
        </Typography>
        <select
          value={scenario.hash}
          onChange={(e) => onScenarioChange("hash", e.target.value as HashMark)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="left">Left Hash</option>
          <option value="middle">Middle</option>
          <option value="right">Right Hash</option>
        </select>
      </div>

      {/* Down & Distance */}
      <div className="flex flex-col space-y-2">
        <Typography variant="caption" className="text-secondary font-medium">
          Down & Distance
        </Typography>
        <select
          value={scenario.downDistance}
          onChange={(e) => onScenarioChange("downDistance", e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="1st & 10">1st & 10</option>
          <option value="1st & 5">1st & 5</option>
          <option value="2nd & 10">2nd & 10</option>
          <option value="2nd & 7">2nd & 7</option>
          <option value="2nd & 5">2nd & 5</option>
          <option value="2nd & 3">2nd & 3</option>
          <option value="3rd & 10">3rd & 10</option>
          <option value="3rd & 7">3rd & 7</option>
          <option value="3rd & 3">3rd & 3</option>
          <option value="3rd & 1">3rd & 1</option>
          <option value="4th & 1">4th & 1</option>
        </select>
      </div>

      {/* Field Position */}
      <div className="flex flex-col space-y-2">
        <Typography variant="caption" className="text-secondary font-medium">
          Field Position
        </Typography>
        <select
          value={scenario.fieldPosition}
          onChange={(e) =>
            onScenarioChange("fieldPosition", e.target.value as FieldPosition)
          }
          className="px-3 py-2 text-sm rounded-lg border border-border bg-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="plus_territory">Plus Territory (Opp 40-50)</option>
          <option value="midfield">Midfield (Own 40-Opp 40)</option>
          <option value="red_zone">Red Zone (Inside 20)</option>
          <option value="backed_up">Backed Up (Own 10 or less)</option>
        </select>
      </div>

      <CustomSelectField
        label="Defensive Front"
        value={String(scenario.defensiveFront)}
        options={FRONT_OPTIONS}
        custom={custom.defensiveFront}
        onChange={(v) => onScenarioChange("defensiveFront", v)}
        onOpenCustom={() => onOpenCustom("defensiveFront")}
        onCommitCustom={(v) => onSetCustomValue("defensiveFront", v)}
        onCloseCustom={() => onCloseCustom("defensiveFront")}
      />

      <CustomSelectField
        label="Coverage"
        value={String(scenario.coverage)}
        options={COVERAGE_OPTIONS}
        custom={custom.coverage}
        onChange={(v) => onScenarioChange("coverage", v)}
        onOpenCustom={() => onOpenCustom("coverage")}
        onCommitCustom={(v) => onSetCustomValue("coverage", v)}
        onCloseCustom={() => onCloseCustom("coverage")}
      />

      <CustomSelectField
        label="Blitz Package"
        value={String(scenario.blitz)}
        options={BLITZ_OPTIONS}
        custom={custom.blitz}
        onChange={(v) => onScenarioChange("blitz", v)}
        onOpenCustom={() => onOpenCustom("blitz")}
        onCommitCustom={(v) => onSetCustomValue("blitz", v)}
        onCloseCustom={() => onCloseCustom("blitz")}
      />
    </div>
  );
}

export function PracticeScriptPlayScenario({
  scriptPlay,
  onUpdateRepetitions,
  onUpdateScenario,
}: {
  scriptPlay: PracticeScriptPlay;
  onUpdateRepetitions: (repetitions: number) => void;
  onUpdateScenario?: (scenario: {
    hash?: "left" | "middle" | "right";
    downDistance?: string;
    fieldPosition?: "plus_territory" | "red_zone" | "backed_up" | "midfield";
    defensiveFront?:
      | "base"
      | "4-3"
      | "3-4"
      | "nickel"
      | "dime"
      | "bear"
      | "tite";
    coverage?:
      | "cover_0"
      | "cover_1"
      | "cover_2"
      | "cover_3"
      | "cover_4"
      | "cover_6"
      | "quarters"
      | "man";
    blitz?:
      | "none"
      | "edge"
      | "a_gap"
      | "b_gap"
      | "sim_pressure"
      | "zone_blitz"
      | "all_out";
  }) => void;
}) {
  const initialScenario = useMemo(
    () => getInitialScenario(scriptPlay),
    [scriptPlay]
  );

  const [repetitionsValue, setRepetitionsValue] = useState(
    scriptPlay.repetitions
  );
  const [scenario, setScenario] = useState<Scenario>(initialScenario);

  const [custom, setCustom] = useState<ScenarioCustomState>({
    defensiveFront: { value: "", isOpen: false },
    coverage: { value: "", isOpen: false },
    blitz: { value: "", isOpen: false },
  });

  const commitScenario = useCallback(
    (next: Scenario) => {
      setScenario(next);
      if (onUpdateScenario) {
        // Type assertion needed: internal Scenario allows arbitrary strings for custom values,
        // but the callback expects narrower enum types. Runtime values are always valid.
        onUpdateScenario({
          hash: next.hash,
          downDistance: next.downDistance,
          fieldPosition: next.fieldPosition,
          defensiveFront: next.defensiveFront as Parameters<
            typeof onUpdateScenario
          >[0]["defensiveFront"],
          coverage: next.coverage as Parameters<
            typeof onUpdateScenario
          >[0]["coverage"],
          blitz: next.blitz as Parameters<typeof onUpdateScenario>[0]["blitz"],
        });
      }
    },
    [onUpdateScenario]
  );

  const handleScenarioChange = useCallback(
    (field: ScenarioField, value: Scenario[ScenarioField]) => {
      commitScenario(updateScenario(scenario, field, value));
    },
    [commitScenario, scenario]
  );

  const openCustom = useCallback((field: CustomField) => {
    setCustom((prev) => ({
      ...prev,
      [field]: { ...prev[field], isOpen: true },
    }));
  }, []);

  const closeCustom = useCallback((field: CustomField) => {
    setCustom((prev) => ({ ...prev, [field]: { value: "", isOpen: false } }));
  }, []);

  const setCustomValue = useCallback((field: CustomField, value: string) => {
    setCustom((prev) => ({ ...prev, [field]: { ...prev[field], value } }));
  }, []);

  const handleRepetitionsChange = useCallback(
    (next: number) => {
      const clamped = clampRepetitions(next);
      setRepetitionsValue(clamped);
      onUpdateRepetitions(clamped);
    },
    [onUpdateRepetitions]
  );

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <RepetitionsSection
        repetitionsValue={repetitionsValue}
        onChange={handleRepetitionsChange}
      />

      <ScenarioGrid
        scenario={scenario}
        custom={custom}
        onScenarioChange={handleScenarioChange}
        onOpenCustom={openCustom}
        onCloseCustom={closeCustom}
        onSetCustomValue={setCustomValue}
      />
    </div>
  );
}
