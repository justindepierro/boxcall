/**
 * DiagramSection - Play diagram upload
 *
 * Moved up in the form hierarchy because:
 * - Diagrams are the visual heart of a play
 * - Coaches often have diagrams ready to upload
 * - Quick visual confirmation during play creation
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Icon } from "../../../ui/Icon/Icon";
import { ImageUpload } from "../../../ui/ImageUpload";

interface DiagramSectionProps {
  diagramUrl: string | null;
  onDiagramChange: (url: string | null) => void;
}

export const DiagramSection: React.FC<DiagramSectionProps> = ({
  diagramUrl,
  onDiagramChange,
}) => {
  return (
    <div className="space-y-sm">
      {/* Section Header */}
      <div className="flex items-center gap-sm">
        <div className="p-xs bg-gradient-to-br from-jade-500/20 to-jade-600/10 rounded-lg shadow-sm">
          <Icon name="image" className="h-5 w-5 text-jade-600" />
        </div>
        <div>
          <Typography variant="label-lg" className="text-primary font-semibold">
            Play Diagram
          </Typography>
          <Typography variant="caption" className="text-tertiary">
            Upload a photo or screenshot of your play
          </Typography>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-gradient-to-br from-surface-muted to-surface-elevated rounded-xl p-sm border border-neutral-200/50 transition-all hover:border-jade-300/50 hover:shadow-sm">
        <ImageUpload
          value={diagramUrl}
          onChange={onDiagramChange}
          bucket="play-diagrams"
          storagePath="diagrams"
          maxSizeMB={10}
          uploadButtonText="Upload Diagram"
          showPreview={true}
        />
      </div>
    </div>
  );
};
