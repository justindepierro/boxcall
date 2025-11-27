import React, { useEffect, useState } from "react";
import { useAuth, useAuthLoading, useAuthProfile } from "../app/auth-store";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Typography } from "../components/design-system/Typography";
import { supabase } from "../lib/supabase";
import { PageLayout } from "../components/layout/PageLayout";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { MultiBadgeDisplay } from "../components/ui/MultiBadgeDisplay";
import { Aurora } from "../components/ui/Aurora";
import { AvatarEditor } from "../components/profile/AvatarEditor";
import {
  Camera,
  Pencil,
  User,
  Trophy,
  Link2,
  AlertTriangle,
  Activity,
} from "lucide-react";
/**
 * Helper component for displaying validation errors
 */
const ValidationError: React.FC<{ error?: string }> = ({ error }) => {
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
export const ProfilePage: React.FC = () => {
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
        console.log(
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
          text: "Failed to update profile: " + error.message,
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
    console.log("📸 Cropped avatar received, uploading...");
    // Convert blob to file
    const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });

    // Set the file (this will show in the preview)
    setAvatarFile(croppedFile);

    // Immediately upload it
    if (!profile?.id) {
      console.error("No profile ID");
      return;
    }

    setAvatarUploading(true);
    try {
      // Generate unique filename to avoid caching issues
      const fileExt = "jpg";
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      console.log("📤 Uploading to:", filePath);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, croppedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful:", uploadData);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;
      console.log("🔗 Public URL:", avatarUrl);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      console.log("✅ Profile updated with new avatar");

      // Refresh profile data
      await fetchUserProfile();

      setMessage({
        type: "success",
        text: "Avatar updated successfully!",
      });

      // Clear the file after successful upload
      setAvatarFile(null);
    } catch (error) {
      console.error("❌ Avatar upload failed:", error);
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
      console.error("Avatar upload failed:", error);
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
          text: "Failed to send password reset email: " + error.message,
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
      <PageLayout>
        <div className="text-center py-spacing-2xl">
          <Typography
            variant="headline-md"
            as="h1"
            className="text-error mb-spacing-md"
          >
            Profile Not Found
          </Typography>
          <p className="text-secondary">
            Unable to load your profile information.
          </p>
        </div>
      </PageLayout>
    );
  }
  return (
    <Aurora variant="shell" fullHeight>
      <PageLayout
        title="My Profile"
        subtitle="Manage your account information and preferences"
        variant="form"
      >
        {/* Message Display */}
        {message && (
          <div
            className={`mb-spacing-lg p-spacing-md rounded-lg border ${
              message.type === "success"
                ? "bg-success-bg border-success text-success"
                : "bg-error-bg border-error text-error"
            }`}
          >
            {message.text}
          </div>
        )}
        {/* Profile Form */}
        <form onSubmit={handleSaveProfile} className="space-y-spacing-lg">
          {/* Avatar Upload Section - Enhanced */}
          <div className="relative overflow-hidden bg-aurora-shell rounded-aurora p-spacing-xl shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-secondary/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative">
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-brand-primary font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Camera className="text-brand-primary w-4 h-4" />
                </span>
                Profile Picture
              </Typography>
              <div className="flex items-center space-x-spacing-lg">
                <div className="relative">
                  {/* Avatar Container - Larger Size */}
                  <div className="w-32 h-32 rounded-2xl bg-aurora-emerald p-spacing-xs shadow-lg">
                    <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Typography
                          variant="headline-xl"
                          className="text-muted font-bold"
                        >
                          {profile.full_name?.charAt(0) ||
                            profile.display_name?.charAt(0) ||
                            "U"}
                        </Typography>
                      )}
                    </div>
                  </div>

                  {/* Success Badge */}
                  {avatarFile && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-surface-primary">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {/* Upload Info */}
                  <Typography
                    variant="body-md"
                    className="font-medium mb-spacing-xs"
                  >
                    Your Profile Picture
                  </Typography>
                  <Typography
                    variant="body-sm"
                    className="text-muted mb-spacing-md"
                  >
                    Upload a new picture or edit your existing one
                  </Typography>

                  {/* Action Buttons */}
                  <div className="flex gap-spacing-sm mb-spacing-sm">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        console.log("Upload Picture clicked");
                        fileInputRef.current?.click();
                      }}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Picture
                    </Button>

                    {profile.avatar_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          console.log("Edit Current Picture clicked");
                          // Fetch current avatar as blob
                          try {
                            const response = await fetch(profile.avatar_url!);
                            const blob = await response.blob();
                            const file = new File(
                              [blob],
                              "current-avatar.jpg",
                              { type: blob.type }
                            );
                            console.log("Loaded current avatar:", file);
                            setAvatarFile(file);
                            setShowAvatarEditor(true);
                          } catch (error) {
                            console.error(
                              "Failed to load current avatar:",
                              error
                            );
                          }
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Current
                      </Button>
                    )}
                  </div>

                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      console.log("📸 File input onChange - file:", file?.name);
                      if (file) {
                        console.log("📸 Opening editor with file:", file.name);
                        setAvatarFile(file);
                        setShowAvatarEditor(true);
                      }
                      // Reset input
                      if (e.target) e.target.value = "";
                    }}
                    className="hidden"
                  />

                  <Typography variant="body-xs" className="text-tertiary">
                    JPG, PNG, or GIF • Max 5MB • Square images work best
                  </Typography>
                  {avatarFile && (
                    <div className="mt-spacing-xs p-spacing-xs bg-success/10 border border-success/20 rounded-lg">
                      <Typography
                        variant="body-xs"
                        className="text-success font-medium"
                      >
                        ✓ Ready to upload: {avatarFile.name}
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Information - Enhanced */}
          <Card className="p-spacing-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300">
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-spacing-lg text-brand-primary font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-gradient-to-br from-jade-50 to-jade-100 border-2 border-jade-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                <User className="text-jade-600 w-4 h-4" />
              </span>
              Basic Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Email Address
                </Typography>
                <Input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Display Name
                </Typography>
                <Input
                  type="text"
                  placeholder="How you'd like to be called"
                  value={formData.display_name}
                  onChange={(e) =>
                    handleInputChange("display_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Full Name
                </Typography>
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={formData.full_name}
                  onChange={(e) =>
                    handleInputChange("full_name", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Phone Number
                </Typography>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={validationErrors.phone ? "border-error-500" : ""}
                />
                <ValidationError error={validationErrors.phone} />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Role & Subscription
                </Typography>
                <MultiBadgeDisplay
                  isAdmin={profile.is_admin}
                  appRole={profile.app_role || profile.role}
                  subscriptionTier={profile.subscription_tier}
                  size="md"
                  layout="wrap"
                />
                <p className="text-xs text-muted mt-spacing-xs">
                  Role is set by team administrators
                </p>
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary dark:text-border-light mb-spacing-xs"
                >
                  Address
                </Typography>
                <Input
                  type="text"
                  placeholder="Your address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-spacing-lg">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-primary dark:text-border-light mb-spacing-xs"
              >
                Bio
              </Typography>
              <textarea
                rows={4}
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full px-spacing-sm py-spacing-xs border border-medium dark:border-text-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus dark:bg-text-primary dark:text-inverse font-sans"
              />
            </div>
          </Card>

          {/* Athletic Information - Only show for players */}
          {profile.app_role === "player" && (
            <Card className="p-spacing-xl shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-success font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Activity className="text-emerald-600 w-4 h-4" />
                </span>
                Athletic Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Position
                  </Typography>
                  <Input
                    type="text"
                    placeholder="e.g., Quarterback, Running Back"
                    value={formData.position}
                    onChange={(e) =>
                      handleInputChange("position", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Jersey Number
                  </Typography>
                  <Input
                    type="number"
                    placeholder="99"
                    min="0"
                    max="99"
                    value={formData.jersey_number}
                    onChange={(e) =>
                      handleInputChange("jersey_number", e.target.value)
                    }
                    className={
                      validationErrors.jersey_number ? "border-error-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.jersey_number} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Height (inches)
                  </Typography>
                  <Input
                    type="number"
                    placeholder="72"
                    min="48"
                    max="84"
                    value={formData.height_inches}
                    onChange={(e) =>
                      handleInputChange("height_inches", e.target.value)
                    }
                    className={
                      validationErrors.height_inches ? "border-error-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.height_inches} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Weight (lbs)
                  </Typography>
                  <Input
                    type="number"
                    placeholder="180"
                    min="80"
                    max="400"
                    value={formData.weight_lbs}
                    onChange={(e) =>
                      handleInputChange("weight_lbs", e.target.value)
                    }
                    className={
                      validationErrors.weight_lbs ? "border-error-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.weight_lbs} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Grade Level
                  </Typography>
                  <select
                    value={formData.grade_level}
                    onChange={(e) =>
                      handleInputChange("grade_level", e.target.value)
                    }
                    className="w-full px-spacing-sm py-spacing-xs border border-medium dark:border-text-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus dark:bg-text-primary dark:text-inverse font-sans"
                  >
                    <option value="">Select grade level</option>
                    <option value="9th">9th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="11th">11th Grade</option>
                    <option value="12th">12th Grade</option>
                    <option value="college">College</option>
                    <option value="adult">Adult</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Coaching Information - Show for coaches and admins */}
          {(profile.app_role === "coach" ||
            profile.app_role === "free_coach" ||
            profile.app_role === "head_coach" ||
            profile.is_admin) && (
            <Card className="p-spacing-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-blue-600 font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Trophy className="text-blue-600 w-4 h-4" />
                </span>
                Coaching Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Years Coaching
                  </Typography>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.years_coaching}
                    onChange={(e) =>
                      handleInputChange("years_coaching", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Current School/Organization
                  </Typography>
                  <Input
                    type="text"
                    placeholder="e.g., BoxCall High School"
                    value={formData.current_school}
                    onChange={(e) =>
                      handleInputChange("current_school", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Coaching Experience
                  </Typography>
                  <Input
                    type="text"
                    placeholder="e.g., Offensive Coordinator, Position Coach"
                    value={formData.coaching_experience}
                    onChange={(e) =>
                      handleInputChange("coaching_experience", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Education
                  </Typography>
                  <Input
                    type="text"
                    placeholder="e.g., Bachelor's in Sports Science"
                    value={formData.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Coaching Philosophy
                  </Typography>
                  <textarea
                    rows={3}
                    placeholder="Share your coaching philosophy and approach..."
                    value={formData.coaching_philosophy}
                    onChange={(e) =>
                      handleInputChange("coaching_philosophy", e.target.value)
                    }
                    className="w-full px-spacing-sm py-spacing-xs border border-medium dark:border-text-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus dark:bg-text-primary dark:text-inverse font-sans"
                  />
                </div>
                <div className="md:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-primary mb-spacing-xs"
                  >
                    Certifications
                  </Typography>
                  <Input
                    type="text"
                    placeholder="e.g., NFHS Certified, CPR/First Aid"
                    value={formData.certifications}
                    onChange={(e) =>
                      handleInputChange("certifications", e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Emergency Contact Information - Enhanced */}
          <Card className="p-spacing-xl shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-spacing-lg text-error font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-gradient-to-br from-red-50 to-red-100 border-2 border-error-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                <AlertTriangle className="text-error-600 w-4 h-4" />
              </span>
              Emergency Contact
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Emergency Contact Name
                </Typography>
                <Input
                  type="text"
                  placeholder="Full name of emergency contact"
                  value={formData.emergency_contact}
                  onChange={(e) =>
                    handleInputChange("emergency_contact", e.target.value)
                  }
                  className={
                    validationErrors.emergency_contact ? "border-error-500" : ""
                  }
                />
                <ValidationError error={validationErrors.emergency_contact} />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary mb-spacing-xs"
                >
                  Emergency Contact Phone
                </Typography>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.emergency_phone}
                  onChange={(e) =>
                    handleInputChange("emergency_phone", e.target.value)
                  }
                  className={
                    validationErrors.emergency_phone ? "border-error-500" : ""
                  }
                />
                <ValidationError error={validationErrors.emergency_phone} />
              </div>
            </div>
          </Card>

          {/* Coaching Information - Only show for coaches */}
          {(profile.app_role === "coach" ||
            profile.app_role === "free_coach" ||
            profile.app_role === "head_coach" ||
            profile.is_admin) && (
            <Card className="relative overflow-hidden p-spacing-xl shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-60"></div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-purple-600 font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Trophy className="text-purple-600 w-4 h-4" />
                </span>
                Coaching Information
              </Typography>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-lg">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Years of Coaching Experience
                  </Typography>
                  <Input
                    type="number"
                    placeholder="5"
                    value={formData.years_coaching}
                    onChange={(e) =>
                      handleInputChange("years_coaching", e.target.value)
                    }
                    min="0"
                    max="50"
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Current School/Organization
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Madison High School"
                    value={formData.current_school}
                    onChange={(e) =>
                      handleInputChange("current_school", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Education
                  </Typography>
                  <Input
                    type="text"
                    placeholder="BS Exercise Science - University of Wisconsin"
                    value={formData.education}
                    onChange={(e) =>
                      handleInputChange("education", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Certifications
                  </Typography>
                  <Input
                    type="text"
                    placeholder="NFHS Certified, First Aid/CPR"
                    value={formData.certifications}
                    onChange={(e) =>
                      handleInputChange("certifications", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Specializations
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Offense, Player Development, Leadership"
                    value={formData.specializations}
                    onChange={(e) =>
                      handleInputChange("specializations", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Coaching System
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Spread Offense, 4-3 Defense"
                    value={formData.coaching_system}
                    onChange={(e) =>
                      handleInputChange("coaching_system", e.target.value)
                    }
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Previous Schools
                  </Typography>
                  <Input
                    type="text"
                    placeholder="West High School (2018-2021), Central Middle School (2015-2018)"
                    value={formData.previous_schools}
                    onChange={(e) =>
                      handleInputChange("previous_schools", e.target.value)
                    }
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Coaching Experience
                  </Typography>
                  <textarea
                    placeholder="Describe your coaching background, achievements, and experience..."
                    value={formData.coaching_experience}
                    onChange={(e) =>
                      handleInputChange("coaching_experience", e.target.value)
                    }
                    rows={3}
                    className="w-full px-spacing-sm py-spacing-xs border border-primary dark:border-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Coaching Philosophy
                  </Typography>
                  <textarea
                    placeholder="Share your coaching philosophy and approach to player development..."
                    value={formData.coaching_philosophy}
                    onChange={(e) =>
                      handleInputChange("coaching_philosophy", e.target.value)
                    }
                    rows={3}
                    className="w-full px-spacing-sm py-spacing-xs border border-primary dark:border-light rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                  >
                    Mentors & Influences
                  </Typography>
                  <Input
                    type="text"
                    placeholder="Coach Smith (Head Coach), Coach Johnson (Offensive Coordinator)"
                    value={formData.mentors}
                    onChange={(e) =>
                      handleInputChange("mentors", e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Social Media Links - Enhanced */}
          <Card className="relative overflow-hidden p-spacing-xl shadow-md shadow-indigo-500/10 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
            <div className="absolute top-0 left-0 w-16 h-16 bg-indigo-100 rounded-full -ml-8 -mt-8 opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-indigo-100 rounded-full -mr-6 -mb-6 opacity-60"></div>
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-spacing-lg text-indigo-600 font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 rounded-lg flex items-center justify-center mr-spacing-sm">
                <Link2 className="text-indigo-600 w-4 h-4" />
              </span>
              Social Media & Links
            </Typography>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-spacing-lg">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  Personal Website
                </Typography>
                <Input
                  type="url"
                  placeholder="https://www.yourwebsite.com"
                  value={formData.personal_website}
                  onChange={(e) =>
                    handleInputChange("personal_website", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  Twitter/X
                </Typography>
                <Input
                  type="text"
                  placeholder="@yourusername or full URL"
                  value={formData.social_twitter}
                  onChange={(e) =>
                    handleInputChange("social_twitter", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  Instagram
                </Typography>
                <Input
                  type="text"
                  placeholder="@yourusername or full URL"
                  value={formData.social_instagram}
                  onChange={(e) =>
                    handleInputChange("social_instagram", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  LinkedIn
                </Typography>
                <Input
                  type="text"
                  placeholder="linkedin.com/in/yourprofile"
                  value={formData.social_linkedin}
                  onChange={(e) =>
                    handleInputChange("social_linkedin", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  TikTok
                </Typography>
                <Input
                  type="text"
                  placeholder="@yourusername or full URL"
                  value={formData.social_tiktok}
                  onChange={(e) =>
                    handleInputChange("social_tiktok", e.target.value)
                  }
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-primary dark:text-border-light mb-spacing-xs"
                >
                  YouTube
                </Typography>
                <Input
                  type="text"
                  placeholder="youtube.com/@yourchannel"
                  value={formData.social_youtube}
                  onChange={(e) =>
                    handleInputChange("social_youtube", e.target.value)
                  }
                />
              </div>
            </div>
          </Card>

          {/* Account Security */}
          <Card className="p-spacing-lg shadow-md hover:shadow-lg transition-all duration-300">
            <Typography variant="headline-sm" as="h2" className="mb-spacing-md">
              Account Security
            </Typography>
            <div className="space-y-spacing-md">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-primary dark:text-border-light mb-spacing-xs"
                >
                  Password
                </Typography>
                <div className="flex items-center space-x-spacing-md">
                  <Input
                    type="password"
                    value="••••••••••"
                    disabled
                    className="surface-subtle dark:bg-text-primary"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handlePasswordChange}
                  >
                    Change Password
                  </Button>
                </div>
                <p className="text-xs text-muted mt-1">
                  A password reset link will be sent to your email
                </p>
              </div>
            </div>
          </Card>

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
              {saving && avatarUploading
                ? "Uploading..."
                : saving
                  ? "Saving..."
                  : "Save Changes"}
            </Button>
          </div>
        </form>
        {/* Account Info */}
        <div className="mt-spacing-xl surface-subtle dark:bg-secondary/50 rounded-lg p-spacing-lg">
          <Typography variant="headline-sm" as="h3" className="mb-spacing-sm">
            Account Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-md text-sm">
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
              <div className="inline-flex items-center gap-spacing-xs">
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
              <code className="text-xs surface-subtle dark:bg-text-primary px-spacing-xs py-1 rounded-lg">
                {profile.id.substring(0, 8)}...
              </code>
            </div>
          </div>
        </div>

        {/* Avatar Editor Modal */}
        {avatarFile && showAvatarEditor && (
          <>
            {console.log(
              "Rendering AvatarEditor - isOpen:",
              showAvatarEditor,
              "file:",
              avatarFile.name
            )}
            <AvatarEditor
              isOpen={showAvatarEditor}
              onClose={() => {
                console.log("AvatarEditor onClose called");
                setShowAvatarEditor(false);
                setAvatarFile(null);
              }}
              imageFile={avatarFile}
              onSave={handleCroppedAvatar}
            />
          </>
        )}
      </PageLayout>
    </Aurora>
  );
};
