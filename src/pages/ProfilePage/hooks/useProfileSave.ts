/**
 * useProfileSave - Manages saving profile changes to the database
 */
import { useState, useCallback } from "react";
import type { Database } from "../../../types/database";
import type { ProfileFormData } from "./useProfileForm";
import { supabase } from "../../../lib/supabase";
import { debug } from "../../../utils/logger";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UseProfileSaveReturn {
  saving: boolean;
  message: { type: "success" | "error"; text: string } | null;
  setMessage: React.Dispatch<
    React.SetStateAction<{ type: "success" | "error"; text: string } | null>
  >;
  handleSaveProfile: (
    e: React.FormEvent,
    formData: ProfileFormData,
    validateForm: () => boolean,
    handleAvatarUpload: () => Promise<string | null>,
    avatarFile: File | null
  ) => Promise<void>;
  handlePasswordChange: () => Promise<void>;
}

// Build the full profile update object
const buildFullUpdateData = (
  formData: ProfileFormData,
  avatarUrl: string | null | undefined
) => ({
  display_name: formData.display_name || null,
  full_name: formData.full_name || null,
  phone: formData.phone || null,
  bio: formData.bio || null,
  address: formData.address || null,
  avatar_url: avatarUrl,
  // Athletic information
  position: formData.position || null,
  jersey_number: formData.jersey_number
    ? parseInt(formData.jersey_number)
    : null,
  height_inches: formData.height_inches
    ? parseFloat(formData.height_inches)
    : null,
  weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
  grade_level: formData.grade_level || null,
  // Emergency contact information
  emergency_contact: formData.emergency_contact || null,
  emergency_phone: formData.emergency_phone || null,
  // Coaching information
  coaching_experience: formData.coaching_experience || null,
  education: formData.education || null,
  certifications: formData.certifications || null,
  coaching_philosophy: formData.coaching_philosophy || null,
  specializations: formData.specializations || null,
  current_school: formData.current_school || null,
  previous_schools: formData.previous_schools || null,
  mentors: formData.mentors || null,
  coaching_system: formData.coaching_system || null,
  years_coaching: formData.years_coaching
    ? parseInt(formData.years_coaching)
    : null,
  // Social media links
  social_twitter: formData.social_twitter || null,
  social_instagram: formData.social_instagram || null,
  social_linkedin: formData.social_linkedin || null,
  social_tiktok: formData.social_tiktok || null,
  social_youtube: formData.social_youtube || null,
  personal_website: formData.personal_website || null,
  updated_at: new Date().toISOString(),
});

// Build the fallback update object (for when new columns don't exist yet)
const buildFallbackUpdateData = (
  formData: ProfileFormData,
  avatarUrl: string | null | undefined
) => ({
  display_name: formData.display_name || null,
  full_name: formData.full_name || null,
  phone: formData.phone || null,
  bio: formData.bio || null,
  address: formData.address || null,
  avatar_url: avatarUrl,
  // Athletic information (existing fields only)
  position: formData.position || null,
  jersey_number: formData.jersey_number
    ? parseInt(formData.jersey_number)
    : null,
  height_inches: formData.height_inches
    ? parseFloat(formData.height_inches)
    : null,
  weight_lbs: formData.weight_lbs ? parseFloat(formData.weight_lbs) : null,
  grade_level: formData.grade_level || null,
  // Emergency contact information (existing fields only)
  emergency_contact: formData.emergency_contact || null,
  emergency_phone: formData.emergency_phone || null,
  updated_at: new Date().toISOString(),
});

export function useProfileSave(
  profile: Profile | null,
  fetchUserProfile: (userId: string) => Promise<void>,
  setAvatarFile: (file: File | null) => void
): UseProfileSaveReturn {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Save profile changes
  const handleSaveProfile = useCallback(
    async (
      e: React.FormEvent,
      formData: ProfileFormData,
      validateForm: () => boolean,
      handleAvatarUpload: () => Promise<string | null>,
      avatarFile: File | null
    ) => {
      e.preventDefault();
      if (!profile) return;

      // Validate form before saving
      if (!validateForm()) {
        setMessage({
          type: "error",
          text: "Please fix the validation errors below",
        });
        return;
      }

      setSaving(true);
      setMessage(null);
      try {
        // Handle avatar upload if present
        let avatarUrl = profile.avatar_url;
        if (avatarFile) {
          const uploadedAvatarUrl = await handleAvatarUpload();
          if (uploadedAvatarUrl) {
            avatarUrl = uploadedAvatarUrl;
          }
        }

        // First try to update with all new fields
        let { error } = await supabase
          .from("profiles")
          .update(buildFullUpdateData(formData, avatarUrl))
          .eq("id", profile.id);

        // If the update failed due to missing columns, try again with just the existing fields
        if (
          error &&
          error.message?.includes("column") &&
          error.message?.includes("does not exist")
        ) {
          debug(
            "New columns not available yet, saving with existing fields only"
          );
          const { error: fallbackError } = await supabase
            .from("profiles")
            .update(buildFallbackUpdateData(formData, avatarUrl))
            .eq("id", profile.id);

          if (fallbackError) {
            error = fallbackError;
          } else {
            error = null;
            setMessage({
              type: "success",
              text: "Profile saved successfully! Note: Coaching info and social media fields will be available after database migration.",
            });
          }
        }
        if (error) {
          setMessage({
            type: "error",
            text: `Failed to update profile: ${error.message}`,
          });
        } else {
          // Clear avatar file after successful upload
          setAvatarFile(null);
          // Refresh global auth profile to keep the app in sync
          await fetchUserProfile(profile.id);
          setMessage({
            type: "success",
            text: "Profile updated successfully!",
          });
        }
      } catch {
        setMessage({ type: "error", text: "An unexpected error occurred" });
      } finally {
        setSaving(false);
      }
    },
    [profile, fetchUserProfile, setAvatarFile]
  );

  // Handle password change
  const handlePasswordChange = useCallback(async () => {
    if (!profile?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        profile.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      if (error) {
        setMessage({
          type: "error",
          text: `Failed to send password reset email: ${error.message}`,
        });
      } else {
        setMessage({
          type: "success",
          text: "Password reset email sent! Check your inbox.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    }
  }, [profile?.email]);

  return {
    saving,
    message,
    setMessage,
    handleSaveProfile,
    handlePasswordChange,
  };
}
