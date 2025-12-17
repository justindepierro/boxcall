/**
 * DiagramPlaceholder Component
 *
 * Placeholder for play diagram preview
 */

import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon";

export function DiagramPlaceholder() {
  return (
    <div className="bg-secondary rounded-lg p-4 border border-primary">
      <div className="flex items-center gap-2 mb-2">
        <Icon name="image" className="text-tertiary" />
        <Typography variant="label-md">Play Diagram</Typography>
      </div>
      <div className="bg-primary rounded border-2 border-dashed border-primary h-32 flex items-center justify-center">
        <Typography variant="body-sm" className="text-tertiary">
          Diagram preview coming soon
        </Typography>
      </div>
    </div>
  );
}
