/**
 * useProfileAvatar - Manages avatar upload and editing
 */
import { useState, useCallback, useRef } from "react";
import type { Database } from "../../../../types/database";
import { supabase } from "../../../../lib/supabase";
import { debug, error as logError } from "../../../../utils/logger";
import { updateProfileAvatarUrl } from "../../../../data/supabase/profiles";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UseProfileAvatarReturn {
  avatarFile: File | null;
  avatarUploading: boolean;
  showAvatarEditor: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;
  setShowAvatarEditor: React.Dispatch<React.SetStateAction<boolean>>;
  handleAvatarUpload: () => Promise<string | null>;
  handleCroppedAvatar: (croppedBlob: Blob) => Promise<void>;
  handleEditCurrentAvatar: (avatarUrl: string) => Promise<void>;
}

export function useProfileAvatar(
  profile: Profile | null,
  fetchUserProfile: (userId: string) => Promise<void>,
  setMessage: (msg: { type: "success" | "error"; text: string } | null) => void
): UseProfileAvatarReturn {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle avatar upload
  const handleAvatarUpload = useCallback(async (): Promise<string | null> => {
    if (!avatarFile || !profile?.id) return null;

    setAvatarUploading(true);
    try {
      // Generate unique filename to avoid caching issues
      const fileExt = avatarFile.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true,
          contentType: avatarFile.type,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      return urlData?.publicUrl || null;
    } catch (error) {
      logError("Avatar upload failed:", error);
      return null;
    } finally {
      setAvatarUploading(false);
    }
  }, [avatarFile, profile?.id]);

  // Handle cropped avatar from editor
  const handleCroppedAvatar = useCallback(
    async (croppedBlob: Blob) => {
      debug("📸 Cropped avatar received, uploading...");
      // Convert blob to file
      const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Set the file (this will show in the preview)
      setAvatarFile(croppedFile);

      // Immediately upload it
      if (!profile?.id) {
        logError("No profile ID");
        return;
      }

      setAvatarUploading(true);
      try {
        // Generate unique filename to avoid caching issues
        const fileExt = "jpg";
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        debug("📤 Uploading to:", filePath);

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, croppedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          logError("Upload error:", uploadError);
          throw uploadError;
        }

        debug("✅ Upload successful:", uploadData);

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const avatarUrl = urlData.publicUrl;
        debug("🔗 Public URL:", avatarUrl);

        // Update profile with new avatar URL
        const updateResult = await updateProfileAvatarUrl(
          profile.id,
          avatarUrl
        );

        if (updateResult.error) {
          logError("Profile update error:", updateResult.error);
          throw updateResult.error;
        }

        debug("✅ Profile updated with new avatar");

        // Refresh profile data
        if (profile.id) {
          await fetchUserProfile(profile.id);
        }

        setMessage({
          type: "success",
          text: "Avatar updated successfully!",
        });

        // Clear the file after successful upload
        setAvatarFile(null);
      } catch (error) {
        logError("❌ Avatar upload failed:", error);
        setMessage({
          type: "error",
          text:
            error instanceof Error ? error.message : "Failed to upload avatar",
        });
      } finally {
        setAvatarUploading(false);
      }
    },
    [profile?.id, fetchUserProfile, setMessage]
  );

  // Handle editing current avatar
  const handleEditCurrentAvatar = useCallback(async (avatarUrl: string) => {
    debug("Edit Current Picture clicked");
    try {
      const response = await fetch(avatarUrl);
      const blob = await response.blob();
      const file = new File([blob], "current-avatar.jpg", {
        type: blob.type,
      });
      debug("Loaded current avatar:", file);
      setAvatarFile(file);
      setShowAvatarEditor(true);
    } catch (error) {
      logError("Failed to load current avatar:", error);
    }
  }, []);

  return {
    avatarFile,
    avatarUploading,
    showAvatarEditor,
    fileInputRef,
    setAvatarFile,
    setShowAvatarEditor,
    handleAvatarUpload,
    handleCroppedAvatar,
    handleEditCurrentAvatar,
  };
}
