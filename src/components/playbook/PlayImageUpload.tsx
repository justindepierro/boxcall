/**
 * Play Image Upload Component
 * 
 * Mobile-optimized image upload with:
 * - Native camera capture (rear camera)
 * - Image compression (max 1MB)
 * - Preview with rotate/crop
 * - File library selection
 */

import React, { useRef, useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { useIsMobile } from '../../hooks/useBreakpoint';
import { Button } from '../ui/Button/Button';
import { Icon } from '../ui/Icon';
import { Typography } from '../design-system/Typography';
import { useToast } from '../../hooks/useToast';

interface PlayImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  currentImage?: string;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
}

export const PlayImageUpload: React.FC<PlayImageUploadProps> = ({
  onImageSelected,
  currentImage,
  maxSizeMB = 1,
  maxWidthOrHeight = 1920,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [isCompressing, setIsCompressing] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleImageCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setIsCompressing(true);

      try {
        // Compression options
        const options = {
          maxSizeMB,
          maxWidthOrHeight,
          useWebWorker: true,
          fileType: 'image/jpeg' as const,
        };

        // Compress image
        const compressedFile = await imageCompression(file, options);

        // Create preview URL
        const previewUrl = URL.createObjectURL(compressedFile);
        setPreview(previewUrl);
        setRotation(0);

        // Notify parent
        onImageSelected(compressedFile, previewUrl);

        toast.success(
          `Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
        );
      } catch (error) {
        console.error('Image compression error:', error);
        toast.error('Failed to process image. Please try again.');
      } finally {
        setIsCompressing(false);
        // Reset input to allow same file selection
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [maxSizeMB, maxWidthOrHeight, onImageSelected, toast]
  );

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      // Ensure capture attribute is set for camera
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleLibraryClick = () => {
    if (fileInputRef.current) {
      // Remove capture attribute to allow library selection
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRemove = () => {
    setPreview(undefined);
    setRotation(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input with camera capture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageCapture}
        disabled={isCompressing}
      />

      {/* Upload buttons */}
      {!preview && (
        <div className="flex flex-col gap-3">
          {isMobile ? (
            <>
              {/* Mobile: Camera button + Upload from library */}
              <Button
                size="lg"
                variant="primary"
                onClick={handleCameraClick}
                disabled={isCompressing}
                className="w-full h-14 justify-center"
              >
                <Icon name="camera" size="lg" />
                <span className="ml-2">Take Photo of Playbook</span>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleLibraryClick}
                disabled={isCompressing}
                className="w-full h-14 justify-center"
              >
                <Icon name="image" size="lg" />
                <span className="ml-2">Upload from Library</span>
              </Button>
            </>
          ) : (
            /* Desktop: Standard file upload */
            <Button
              variant="primary"
              onClick={handleLibraryClick}
              disabled={isCompressing}
            >
              <Icon name="upload" size="md" />
              <span className="ml-2">Upload Play Image</span>
            </Button>
          )}

          <Typography variant="caption" className="text-tertiary text-center">
            {isMobile
              ? 'Take a photo or select from your device'
              : 'Maximum file size: 5MB (will be compressed to 1MB)'}
          </Typography>
        </div>
      )}

      {/* Compression indicator */}
      {isCompressing && (
        <div className="flex items-center justify-center p-8 bg-secondary rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
            <Typography variant="body-sm" className="text-secondary">
              Compressing image...
            </Typography>
          </div>
        </div>
      )}

      {/* Image preview with edit options */}
      {preview && !isCompressing && (
        <div className="relative rounded-lg overflow-hidden bg-secondary">
          <img
            src={preview}
            alt="Play diagram preview"
            className="w-full transition-transform duration-200"
            style={{ transform: `rotate(${rotation}deg)` }}
          />

          {/* Edit toolbar */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRotate}
              className="bg-primary/90 backdrop-blur-sm"
            >
              <Icon name="rotate-cw" size="sm" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleRemove}
              className="bg-primary/90 backdrop-blur-sm"
            >
              <Icon name="trash" size="sm" />
            </Button>
          </div>

          {/* Image info */}
          <div className="absolute bottom-2 left-2 bg-primary/90 backdrop-blur-sm rounded px-3 py-1">
            <Typography variant="caption" className="text-secondary">
              {rotation !== 0 && `Rotated ${rotation}°`}
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayImageUpload;
