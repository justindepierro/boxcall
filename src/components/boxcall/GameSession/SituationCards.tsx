/**
 * SituationCards - Down/Distance and Play Selection cards
 */

import React from "react";
import { Icon } from "../../ui/Icon/Icon";
import { DownDistanceTracker } from "../DownDistanceTracker";
import { SituationFilter } from "../SituationFilter";
import type { DownDistanceCardProps, PlaySelectionCardProps } from "./types";

export const DownDistanceCard: React.FC<DownDistanceCardProps> = ({
  situation,
  onUpdate,
  onFirstDown,
  onNextQuarter,
  disabled,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
      <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
          <Icon name="map-pin" size="sm" className="text-white" />
        </div>
        Game Situation
      </h3>
      <DownDistanceTracker
        situation={situation}
        onUpdate={onUpdate}
        onFirstDown={onFirstDown}
        onNextQuarter={onNextQuarter}
        disabled={disabled}
      />
    </div>
  );
};

export const PlaySelectionCard: React.FC<PlaySelectionCardProps> = ({
  situation,
  gamePlanPlays,
  filteredPlays,
  currentPlay,
  onSelectPlay,
  teamId,
  disabled,
}) => {
  return (
    <div className="rounded-3xl bg-white border border-emerald-100 p-6 shadow-xl shadow-emerald-500/10">
      <h3 className="text-primary font-bold text-lg mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/25">
          <Icon name="list" size="sm" className="text-white" />
        </div>
        Select Play
      </h3>
      <SituationFilter
        situation={situation}
        allPlays={gamePlanPlays}
        filteredPlays={filteredPlays}
        selectedPlay={currentPlay}
        onSelectPlay={onSelectPlay}
        teamId={teamId}
        disabled={disabled}
      />
    </div>
  );
};
