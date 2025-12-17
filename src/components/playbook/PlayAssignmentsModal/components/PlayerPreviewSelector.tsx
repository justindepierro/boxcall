/**
 * PlayerPreviewSelector Component
 *
 * Position selector for coach to preview player view
 */

import { Typography } from "../../../design-system/Typography";
import { FormSelect } from "../../../ui/FormSelect/FormSelect";
import { Icon } from "../../../ui/Icon";
import type { PlayerPreviewSelectorProps } from "./types";

export function PlayerPreviewSelector({
  positions,
  previewPosition,
  onSelectPosition,
}: PlayerPreviewSelectorProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
      <Icon name="user" className="text-blue-600 dark:text-blue-400" />
      <div className="flex-1">
        <Typography
          variant="label-md"
          className="mb-1 text-blue-900 dark:text-blue-100"
        >
          Preview as Position
        </Typography>
        <FormSelect
          value={previewPosition || ""}
          onChange={(value) => onSelectPosition(value || null)}
          placeholder="Select a position..."
          options={positions.map((position) => ({
            value: position,
            label: position,
          }))}
          className="w-full"
        />
      </div>
      <Typography
        variant="caption"
        className="text-blue-700 dark:text-blue-300"
      >
        The selected position will be highlighted as "Your Position"
      </Typography>
    </div>
  );
}
