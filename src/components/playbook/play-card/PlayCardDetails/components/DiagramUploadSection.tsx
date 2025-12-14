/**
 * DiagramUploadSection Component
 *
 * Section for uploading/updating play diagram images.
 */

import React from 'react';
import { Typography } from '../../../design-system/Typography';
import Icon from '../../../ui/Icon/Icon';
import { ImageUpload } from '../../../ui/ImageUpload';
import { DiagramUploadSectionProps } from './types';

export const DiagramUploadSection: React.FC<DiagramUploadSectionProps> = ({
  play,
  optimisticPlay,
  handleInlineSave,
}) => {
  return (
    <div className="mt-md">
      <Typography
        variant="label-lg"
        as="h4"
        className="text-primary flex items-center mb-sm"
      >
        <Icon name="camera" className="h-4 w-4 mr-xs" /> Play Diagram
      </Typography>
      <div className="bg-subtle rounded-lg p-sm">
        <ImageUpload
          value={
            optimisticPlay.diagram_url ||
            (optimisticPlay as any).diagram_image_url ||
            undefined
          }
          onChange={async (url) => {
            await handleInlineSave('diagram_image_url', url || null);
          }}
          bucket="play-diagrams"
          path={`plays/${play.playbook_id}/${play.id}`}
          maxSizeBytes={5 * 1024 * 1024}
          acceptedFormats={[
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/heic',
          ]}
        />
      </div>
    </div>
  );
};
