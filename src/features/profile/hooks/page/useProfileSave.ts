/**
 * useProfileSave - Manages saving profile changes to the database
 */
import { useState, useCallback } from "react";
import type { Database } from "../../../../types/database";
import type { ProfileFormData } from "./useProfileForm";
import { supabase } from "../../../../lib/supabase";
import { debug } from "../../../../utils/logger";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface UseProfileSaveReturn {
  saving: boolean;
  handleSaveProfile: (
    e: React.FormEvent,
    formData: ProfileFormData,
    validateForm: () => boolean,
    handleAvatarUpload: () => Promise<string | null>,
    avatarFile: File | null
  ) => Promise<void>;
  handlePasswordChange: () => Promise<void>;
}

function toNullableString(value: string | null | undefined): string | null {
  return value ? value : null;
}

function toNullableIntUnsafe(value: string | null | undefined): number | null {
  return value ? parseInt(value) : null;
}

function toNullableFloatUnsafe(
  value: string | null | undefined
): number | null {
  return value ? parseFloat(value) : null;
}

// Build the full profile update object
const buildFullUpdateData = (
  formData: ProfileFormData,
  avatarUrl: string | null | undefined
) => ({
  display_name: toNullableString(formData.display_name),
  full_name: toNullableString(formData.full_name),
  phone: toNullableString(formData.phone),
  bio: toNullableString(formData.bio),
  address: toNullableString(formData.address),
  avatar_url: avatarUrl,
  // Athletic information
  position: toNullableString(formData.position),
  jersey_number: toNullableIntUnsafe(formData.jersey_number),
  height_inches: toNullableFloatUnsafe(formData.height_inches),
  weight_lbs: toNullableFloatUnsafe(formData.weight_lbs),
  grade_level: toNullableString(formData.grade_level),
  // Emergency contact information
  emergency_contact: toNullableString(formData.emergency_contact),
  emergency_phone: toNullableString(formData.emergency_phone),
  // Coaching information
  coaching_experience: toNullableString(formData.coaching_experience),
  education: toNullableString(formData.education),
  certifications: toNullableString(formData.certifications),
  coaching_philosophy: toNullableString(formData.coaching_philosophy),
  specializations: toNullableString(formData.specializations),
  current_school: toNullableString(formData.current_school),
  previous_schools: toNullableString(formData.previous_schools),
  mentors: toNullableString(formData.mentors),
  coaching_system: toNullableString(formData.coaching_system),
  years_coaching: toNullableIntUnsafe(formData.years_coaching),
  // Social media links
  social_twitter: toNullableString(formData.social_twitter),
  social_instagram: toNullableString(formData.social_instagram),
  social_linkedin: toNullableString(formData.social_linkedin),
  social_tiktok: toNullableString(formData.social_tiktok),
  social_youtube: toNullableString(formData.social_youtube),
  personal_website: toNullableString(formData.personal_website),
  updated_at: new Date().toISOString(),
});

// Build the fallback update object (for when new columns don't exist yet)
const buildFallbackUpdateData = (
  formData: ProfileFormData,
  avatarUrl: string | null | undefined
) => ({
  display_name: toNullableString(formData.display_name),
  full_name: toNullableString(formData.full_name),
  phone: toNullableString(formData.phone),
  bio: toNullableString(formData.bio),
  address: toNullableString(formData.address),
  avatar_url: avatarUrl,
  // Athletic information (existing fields only)
  position: toNullableString(formData.position),
  jersey_number: toNullableIntUnsafe(formData.jersey_number),
  height_inches: toNullableFloatUnsafe(formData.height_inches),
  weight_lbs: toNullableFloatUnsafe(formData.weight_lbs),
  grade_level: toNullableString(formData.grade_level),
  // Emergency contact information (existing fields only)
  emergency_contact: toNullableString(formData.emergency_contact),
  emergency_phone: toNullableString(formData.emergency_phone),
  updated_at: new Date().toISOString(),
});

export function useProfileSave(
  profile: Profile | null,
  fetchUserProfile: (userId: string) => Promise<void>,
  setAvatarFile: (file: File | null) => void,
  setMessage: (msg: { type: "success" | "error"; text: string } | null) => void
): UseProfileSaveReturn {
  const [saving, setSaving] = useState(false);

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
    [profile, fetchUserProfile, setAvatarFile, setMessage]
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
  }, [profile?.email, setMessage]);

  return {
    saving,
    handleSaveProfile,
    handlePasswordChange,
  };
}
