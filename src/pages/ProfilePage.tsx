import React, { useEffect, useState } from "react";
import { useAuth, useAuthLoading, useAuthProfile } from "../app/auth-store";
import { Button } from "../components/ui/Button";
import { Typography } from "../components/design-system/Typography";
import { supabase } from "../lib/supabase";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { MultiBadgeDisplay } from "../components/ui/MultiBadgeDisplay";
import { AvatarEditor } from "../components/profile/AvatarEditor";
import { debug, error as logError } from "../utils/logger";
import { ProfileAvatar } from "./ProfilePage/components/ProfileAvatar";
import { BasicInfoForm } from "./ProfilePage/components/BasicInfoForm";
import { AthleticInfoForm } from "./ProfilePage/components/AthleticInfoForm";
import { CoachingInfoForm } from "./ProfilePage/components/CoachingInfoForm";
import { EmergencyContactForm } from "./ProfilePage/components/EmergencyContactForm";
import { SocialMediaForm } from "./ProfilePage/components/SocialMediaForm";
import { AccountSecurityForm } from "./ProfilePage/components/AccountSecurityForm";

/**
 * Helper component for displaying validation errors
 * @internal Used by form components, kept for reference
 */
const _ValidationError: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return (
    <Typography variant="body-xs" className="text-error mt-1">
      {error}
    </Typography>
  );
};

/**
 * ProfilePage Component
 *
 * User profile management and settings page.
 * Allows users to update their personal information and preferences.
 */
const ProfilePage: React.FC = () => {
  const profile = useAuthProfile();
  const loading = useAuthLoading();
  const fetchUserProfile = useAuth((s) => s.fetchUserProfile);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    full_name: "",
    phone: "",
    bio: "",
    address: "",
    // Athletic information
    position: "",
    jersey_number: "",
    height_inches: "",
    weight_lbs: "",
    grade_level: "",
    // Emergency contact information
    emergency_contact: "",
    emergency_phone: "",
    // Coaching information
    coaching_experience: "",
    education: "",
    certifications: "",
    coaching_philosophy: "",
    specializations: "",
    current_school: "",
    previous_schools: "",
    mentors: "",
    coaching_system: "",
    years_coaching: "",
    // Social media links
    social_twitter: "",
    social_instagram: "",
    social_linkedin: "",
    social_tiktok: "",
    social_youtube: "",
    personal_website: "",
  });
  // Load profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || "",
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        address: profile.address || "",
        // Athletic information
        position: profile.position || "",
        jersey_number: profile.jersey_number?.toString() || "",
        height_inches: profile.height_inches?.toString() || "",
        weight_lbs: profile.weight_lbs?.toString() || "",
        grade_level: profile.grade_level || "",
        // Emergency contact information
        emergency_contact: profile.emergency_contact || "",
        emergency_phone: profile.emergency_phone || "",
        // Coaching information
        coaching_experience: profile.coaching_experience || "",
        education: profile.education || "",
        certifications: profile.certifications || "",
        coaching_philosophy: profile.coaching_philosophy || "",
        specializations: profile.specializations || "",
        current_school: profile.current_school || "",
        previous_schools: profile.previous_schools || "",
        mentors: profile.mentors || "",
        coaching_system: profile.coaching_system || "",
        years_coaching: profile.years_coaching?.toString() || "",
        // Social media links
        social_twitter: profile.social_twitter || "",
        social_instagram: profile.social_instagram || "",
        social_linkedin: profile.social_linkedin || "",
        social_tiktok: profile.social_tiktok || "",
        social_youtube: profile.social_youtube || "",
        personal_website: profile.personal_website || "",
      });
    }
  }, [profile]);

  // Validation function
  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    // Phone validation
    if (
      formData.phone &&
      !/^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/.test(
        formData.phone
      )
    ) {
      errors.phone =
        "Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)";
    }

    // Emergency phone validation
    if (
      formData.emergency_phone &&
      !/^\(\d{3}\) \d{3}-\d{4}$|^\d{10}$|^\d{3}-\d{3}-\d{4}$/.test(
        formData.emergency_phone
      )
    ) {
      errors.emergency_phone =
        "Please enter a valid emergency contact phone number";
    }

    // Height validation (48-84 inches = 4-7 feet)
    if (formData.height_inches) {
      const height = parseFloat(formData.height_inches);
      if (isNaN(height) || height < 48 || height > 84) {
        errors.height_inches =
          "Height must be between 48 and 84 inches (4-7 feet)";
      }
    }

    // Weight validation (80-400 lbs)
    if (formData.weight_lbs) {
      const weight = parseFloat(formData.weight_lbs);
      if (isNaN(weight) || weight < 80 || weight > 400) {
        errors.weight_lbs = "Weight must be between 80 and 400 lbs";
      }
    }

    // Jersey number validation (0-99)
    if (formData.jersey_number) {
      const jerseyNum = parseInt(formData.jersey_number);
      if (isNaN(jerseyNum) || jerseyNum < 0 || jerseyNum > 99) {
        errors.jersey_number = "Jersey number must be between 0 and 99";
      }
    }

    // Emergency contact required for players/minors
    if (
      (profile?.role === "player" || formData.grade_level) &&
      !formData.emergency_contact
    ) {
      errors.emergency_contact = "Emergency contact is required for players";
    }

    // Emergency phone required if emergency contact is provided
    if (formData.emergency_contact && !formData.emergency_phone) {
      errors.emergency_phone =
        "Emergency contact phone is required when emergency contact is provided";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
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
        .update({
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
          weight_lbs: formData.weight_lbs
            ? parseFloat(formData.weight_lbs)
            : null,
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
        })
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
          .update({
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
            weight_lbs: formData.weight_lbs
              ? parseFloat(formData.weight_lbs)
              : null,
            grade_level: formData.grade_level || null,
            // Emergency contact information (existing fields only)
            emergency_contact: formData.emergency_contact || null,
            emergency_phone: formData.emergency_phone || null,
            updated_at: new Date().toISOString(),
          })
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
        setMessage({ type: "success", text: "Profile updated successfully!" });
      }
    } catch {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setSaving(false);
    }
  };
  // Handle cropped avatar from editor
  const handleCroppedAvatar = async (croppedBlob: Blob) => {
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
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) {
        logError("Profile update error:", updateError);
        throw updateError;
      }

      debug("✅ Profile updated with new avatar");

      // Refresh profile data
      await fetchUserProfile();

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
  };

  // Handle avatar upload
  const handleAvatarUpload = async (): Promise<string | null> => {
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
  };

  // Handle password change
  const handlePasswordChange = async () => {
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
  };
  if (loading) {
    return (
      <LoadingScreen
        title="Loading Profile"
        subtitle="Fetching your profile information and settings..."
      />
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen bg-secondary p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center py-2xl">
            <Typography
              variant="headline-md"
              as="h1"
              className="text-error mb-md"
            >
              Profile Not Found
            </Typography>
            <p className="text-secondary">
              Unable to load your profile information.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-secondary p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6">
          <Typography variant="headline-lg" className="text-primary mb-1">
            My Profile
          </Typography>
          <Typography variant="body" className="text-secondary">
            Manage your account information and preferences
          </Typography>
        </header>
        {/* Message Display */}
        {message && (
          <div
            className={`mb-lg p-md rounded-lg border ${
              message.type === "success"
                ? "bg-success-bg border-success text-success"
                : "bg-error-bg border-error text-error"
            }`}
          >
            {message.text}
          </div>
        )}
        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-lg">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            fullName={profile.full_name}
            avatarFile={avatarFile}
            onUploadClick={() => {
              debug("Upload Picture clicked");
              fileInputRef.current?.click();
            }}
            onEditClick={async () => {
              debug("Edit Current Picture clicked");
              try {
                const response = await fetch(profile.avatar_url!);
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
            }}
            onFileSelect={(file) => {
              debug("📸 File input onChange - file:", file?.name);
              if (file) {
                debug("📸 Opening editor with file:", file.name);
                setAvatarFile(file);
                setShowAvatarEditor(true);
              }
            }}
            fileInputRef={fileInputRef}
          />

          <BasicInfoForm
            email={profile.email || ""}
            displayName={formData.display_name}
            fullName={formData.full_name}
            phone={formData.phone}
            address={formData.address}
            bio={formData.bio}
            isAdmin={profile.is_admin}
            appRole={profile.app_role || profile.role}
            subscriptionTier={profile.subscription_tier}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
          />

          <AthleticInfoForm
            visible={profile.app_role === "player"}
            position={formData.position}
            jerseyNumber={formData.jersey_number}
            heightInches={formData.height_inches}
            weight={formData.weight_lbs}
            gradeLevel={formData.grade_level}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
          />

          <CoachingInfoForm
            visible={
              profile.app_role === "coach" ||
              profile.app_role === "free_coach" ||
              profile.app_role === "head_coach" ||
              profile.is_admin
            }
            yearsCoaching={formData.years_coaching}
            currentSchool={formData.current_school}
            coachingExperience={formData.coaching_experience}
            education={formData.education}
            coachingPhilosophy={formData.coaching_philosophy}
            certifications={formData.certifications}
            onInputChange={handleInputChange}
          />

          <EmergencyContactForm
            emergencyContactName={formData.emergency_contact}
            emergencyPhone={formData.emergency_phone}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
          />

          <SocialMediaForm
            personalWebsite={formData.personal_website}
            twitterUrl={formData.social_twitter}
            instagramUrl={formData.social_instagram}
            linkedinUrl={formData.social_linkedin}
            tiktokUrl={formData.social_tiktok}
            youtubeUrl={formData.social_youtube}
            onInputChange={handleInputChange}
          />

          <AccountSecurityForm onChangePasswordClick={handlePasswordChange} />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving || avatarUploading}
              disabled={saving || avatarUploading}
            >
              {(() => {
                if (saving && avatarUploading) return "Uploading...";
                if (saving) return "Saving...";
                return "Save Changes";
              })()}
            </Button>
          </div>
        </form>
        {/* Account Info */}
        <div className="mt-xl bg-subtle dark:bg-secondary/50 rounded-lg p-lg">
          <Typography variant="headline-sm" as="h3" className="mb-sm">
            Account Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
            <div>
              <span className="font-medium">Account Created:</span>{" "}
              {profile.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "Unknown"}
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>{" "}
              {profile.updated_at
                ? new Date(profile.updated_at).toLocaleDateString()
                : "Never"}
            </div>
            <div>
              <span className="font-medium">Role:</span>{" "}
              <div className="inline-flex items-center gap-xs">
                <MultiBadgeDisplay
                  isAdmin={profile.is_admin}
                  appRole={profile.app_role || profile.role}
                  subscriptionTier={profile.subscription_tier}
                  size="sm"
                  layout="horizontal"
                />
              </div>
            </div>
            <div>
              <span className="font-medium">User ID:</span>{" "}
              <code className="text-xs bg-subtle dark:bg-text-primary px-xs py-1 rounded-lg">
                {profile.id.substring(0, 8)}...
              </code>
            </div>
          </div>
        </div>

        {/* Avatar Editor Modal */}
        {avatarFile && showAvatarEditor && (
          <>
            {debug(
              "Rendering AvatarEditor - isOpen:",
              showAvatarEditor,
              "file:",
              avatarFile.name
            )}
            <AvatarEditor
              isOpen={showAvatarEditor}
              onClose={() => {
                debug("AvatarEditor onClose called");
                setShowAvatarEditor(false);
                setAvatarFile(null);
              }}
              imageFile={avatarFile}
              onSave={handleCroppedAvatar}
            />
          </>
        )}
      </div>
    </div>
  );
};

ProfilePage.displayName = "ProfilePage";

export default React.memo(ProfilePage);
