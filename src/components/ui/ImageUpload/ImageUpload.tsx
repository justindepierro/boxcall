/**
 * ImageUpload Component
 *
 * Handles uploading images to Supabase Storage with preview, validation, and progress
 * Used for play diagram uploads (screenshots/photos from coach's phone)
 *
 * Features:
 * - Drag & drop or click to upload
 * - Image preview with remove option
 * - File validation (type, size)
 * - Upload progress indicator
 * - Mobile-optimized (camera access)
 * - Haptic feedback
 */

import React, { useState, useRef, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { triggerHapticFeedback } from "../../../lib/hapticFeedback";
import { useToast } from "../../../hooks/useToast";
import { info, error as logError } from "../../../utils/logger";

interface ImageUploadProps {
  /** Current image URL (if exists) */
  value?: string | null;
  /** Callback when image is uploaded */
  onChange: (url: string | null) => void;
  /** Storage bucket name */
  bucket?: string;
  /** Storage path prefix */
  storagePath?: string;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Allowed file types */
  acceptedTypes?: string[];
  /** Show preview */
  showPreview?: boolean;
  /** Compact mode (smaller UI) */
  compact?: boolean;
  /** Custom upload button text */
  uploadButtonText?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  bucket = "play-diagrams",
  storagePath = "diagrams",
  maxSizeMB = 10,
  acceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
  ],
  showPreview = true,
  compact = false,
  uploadButtonText = "Upload Diagram",
  disabled = false,
}) => {
  // Disable upload if onChange is not ready (prevents uploads during initial load)
  const isReady = typeof onChange === 'function';
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  /**
   * Validate file before upload
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Accepted: ${acceptedTypes.join(", ")}`;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        return `File too large. Max size: ${maxSizeMB}MB`;
      }

      return null;
    },
    [acceptedTypes, maxSizeMB]
  );

  /**
   * Upload file to Supabase Storage
   */
  const uploadFile = useCallback(
    async (file: File) => {
      // Block upload if component not ready
      if (!isReady) {
        toast.error("Please wait for the page to finish loading");
        return;
      }

      try {
        setUploading(true);
        setUploadProgress(0);
        triggerHapticFeedback("selection");

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
          toast.error(validationError);
          triggerHapticFeedback("error");
          return;
        }

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${storagePath}/${fileName}`;

        info(`[ImageUpload] Uploading file: ${filePath}`);

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Simulate progress (Supabase doesn't provide upload progress yet)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (error) {
          throw error;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        info(`[ImageUpload] Upload successful: ${publicUrl}`);

        // Brief pause at 100% to show completion before closing modal
        await new Promise((resolve) => setTimeout(resolve, 500));

        onChange(publicUrl);
        toast.success("Diagram uploaded successfully!");
        triggerHapticFeedback("success");
      } catch (error) {
        logError("[ImageUpload] Upload failed:", error);
        toast.error("Failed to upload diagram");
        triggerHapticFeedback("error");
        setPreviewUrl(value || null); // Revert to original
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [bucket, storagePath, validateFile, onChange, toast, value, isReady]
  );

  /**
   * Handle file selection
   */
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  /**
   * Handle drag & drop
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  /**
   * Remove uploaded image
   */
  const handleRemove = useCallback(async () => {
    try {
      triggerHapticFeedback("selection");

      // Optional: Delete from storage
      // if (value && value.includes(bucket)) {
      //   const filePath = value.split(`${bucket}/`)[1];
      //   await supabase.storage.from(bucket).remove([filePath]);
      // }

      setPreviewUrl(null);
      onChange(null);
      toast.success("Diagram removed");
      triggerHapticFeedback("success");
    } catch (error) {
      logError("[ImageUpload] Remove failed:", error);
      toast.error("Failed to remove diagram");
    }
  }, [onChange, toast]);

  /**
   * Trigger file input click
   */
  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
    triggerHapticFeedback("selection");
  }, []);

  return (
    <>
      {/* Upload Progress Modal - Prevents accidental navigation during upload */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm">
          <div className="bg-surface rounded-lg p-xl shadow-2xl max-w-sm w-full mx-md space-y-md animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-sm">
              <div className="animate-spin text-jade-600 w-6 h-6 border-4 border-jade-600 border-t-transparent rounded-full" />
              <h3 className="text-lg font-bold text-primary">
                Uploading Diagram...
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="space-y-xs">
              <div className="flex justify-between text-sm text-secondary">
                <span>Progress</span>
                <span className="font-mono font-bold text-jade-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-jade-500 to-jade-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            {/* Warning Message */}
            <div className="flex items-start gap-xs bg-warning-bg border border-warning-border rounded-md p-sm">
              <Icon name="info" className="text-warning-600 flex-shrink-0 mt-0.5" size="sm" />
              <p className="text-xs text-warning-fg">
                Please wait while your diagram uploads. Don't close this card or
                navigate away.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`space-y-sm ${compact ? "text-sm" : ""}`}>
        {/* Preview */}
        {showPreview && previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Play Diagram Preview"
            className={`rounded-lg border-2 border-primary object-cover ${
              compact ? "h-32 w-32" : "h-48 w-full"
            }`}
          />
          {!disabled && (
            <button
              onClick={handleRemove}
              className="absolute -top-2 -right-2 btn-primary rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
              aria-label="Remove diagram"
            >
              <Icon name="close" size="sm" />
            </button>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!previewUrl && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-md text-center transition-colors
            ${dragActive ? "border-jade-500 bg-jade-50" : "border-primary bg-muted"}
            ${(disabled || !isReady) ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-jade-400"}
          `}
          onClick={(!disabled && isReady) ? handleButtonClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || !isReady}
            capture="environment" // Mobile: prefer back camera
          />

          {uploading ? (
            <div className="space-y-sm">
              <div className="animate-spin text-jade-600 mx-auto w-8 h-8 border-4 border-jade-600 border-t-transparent rounded-full" />
              <p className="text-sm text-secondary">
                Uploading... {uploadProgress}%
              </p>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-jade-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-sm">
              <Icon name="camera" size="lg" className="text-tertiary mx-auto" />
              <p className="text-sm text-primary font-medium">
                {uploadButtonText}
              </p>
              <p className="text-xs text-tertiary">
                Drag & drop or click to browse
                <br />
                Max {maxSizeMB}MB • JPG, PNG, WebP
              </p>
            </div>
          )}
        </div>
      )}

      {/* Replace Button (if preview exists) */}
      {showPreview && previewUrl && !disabled && (
        <Button
          variant="secondary"
          size={compact ? "sm" : "md"}
          onClick={handleButtonClick}
          disabled={uploading}
          className="w-full"
        >
          <Icon name="camera" size="sm" />
          Replace Diagram
        </Button>
      )}
      </div>
    </>
  );
};
