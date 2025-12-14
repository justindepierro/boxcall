/**
 * PlayDiagramPreview Component
 *
 * Displays the play diagram image when expanded.
 */

import React from "react";
import { Typography } from "../../../design-system/Typography";
import Icon from "../../../ui/Icon/Icon";
import { PlayDiagramPreviewProps } from "./types";

export const PlayDiagramPreview: React.FC<PlayDiagramPreviewProps> = ({
  diagramUrl,
  diagramImageUrl,
  playName,
}) => {
  const imageUrl = diagramUrl || diagramImageUrl;

  if (!imageUrl) return null;

  return (
    <div className="bg-subtle rounded-lg p-sm">
      <div className="flex items-center justify-between mb-sm">
        <Typography
          variant="label-lg"
          as="h4"
          className="text-primary flex items-center"
        >
          <Icon name="camera" className="h-4 w-4 mr-xs" /> Play Diagram
        </Typography>
      </div>
      <div className="relative max-w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={`${playName} diagram`}
          className="w-full max-h-72 md:max-h-96 rounded-lg border-2 border-primary object-contain"
          crossOrigin="anonymous"
          decoding="async"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};
