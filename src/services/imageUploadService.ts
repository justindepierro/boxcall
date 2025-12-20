/**
 * Image Upload Service
 * Handles uploading images to Supabase Storage for inline use in announcements
 * Automatically resizes and compresses images for optimal performance
 */

import { supabase } from "../lib/supabase";
import { getCurrentUserId } from "../lib/auth-helpers";
import { logError, warn } from "../utils/logger";

const BUCKET_NAME = "announcement-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB original
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_WIDTH = 1200; // Max width for uploaded images
const MAX_HEIGHT = 800; // Max height for uploaded images
const COMPRESSION_QUALITY = 0.85; // JPEG/WebP compression quality

export interface UploadImageResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Resize and compress an image
 */
async function resizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and resize
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            // Create new file with same name and type
            const resizedFile = new File([blob], file.name, {
              type: file.type === "image/png" ? "image/png" : "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          COMPRESSION_QUALITY
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload an image to Supabase Storage
 */
export async function uploadImage(file: File): Promise<UploadImageResult> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error:
          "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    // Get current user
    const userId = getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to upload images.",
      };
    }

    // Resize and compress image (skip GIFs to preserve animation)
    let fileToUpload = file;
    if (file.type !== "image/gif") {
      try {
        fileToUpload = await resizeImage(file);
      } catch (error) {
        warn("Failed to resize image, uploading original:", error);
        // Continue with original file if resize fails
      }
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = fileToUpload.name.split(".").pop();
    const filename = `${userId}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      logError("Upload error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload image.",
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
    };
  } catch (error) {
    logError("Unexpected upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred while uploading.",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(url: string): Promise<boolean> {
  try {
    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(
      `/storage/v1/object/public/${BUCKET_NAME}/`
    );
    if (pathParts.length !== 2) {
      logError("Invalid URL format:", url);
      return false;
    }
    const path = pathParts[1];

    // Delete from Supabase Storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    if (error) {
      logError("Delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    logError("Unexpected delete error:", error);
    return false;
  }
}

/**
 * Validate if a file can be uploaded
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error:
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File too large. Maximum size is 5MB.",
    };
  }

  return { valid: true };
}
