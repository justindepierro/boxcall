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
import {
  Camera,
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
  // Handle avatar upload
  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!avatarFile || !profile?.id) return null;

    setAvatarUploading(true);
    try {
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${profile.id}/${avatarFile.name}`, avatarFile, {
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${profile.id}/${avatarFile.name}`);

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
          <p className="text-text-secondary">
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
                  <div className="w-24 h-24 rounded-2xl bg-aurora-emerald p-spacing-xs shadow-lg">
                    <div className="w-full h-full rounded-xl bg-surface-secondary flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <Typography
                          variant="headline-lg"
                          className="text-text-muted font-bold"
                        >
                          {profile.full_name?.charAt(0) ||
                            profile.display_name?.charAt(0) ||
                            "U"}
                        </Typography>
                      )}
                    </div>
                  </div>
                  {avatarFile && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                    className="mb-spacing-sm file:mr-spacing-md file:py-spacing-sm file:px-spacing-lg file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90 file:cursor-pointer file:transition-colors file:shadow-md"
                  />
                  <Typography variant="body-sm" className="text-text-muted">
                    Upload a new profile picture • JPG, PNG, or GIF • Max 5MB
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
          <Card className="p-spacing-xl">
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-spacing-lg text-brand-primary font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center mr-spacing-sm">
                <User className="text-brand-primary w-4 h-4" />
              </span>
              Basic Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-2"
                >
                  Email Address
                </Typography>
                <Input
                  type="email"
                  value={profile.email || ""}
                  disabled
                  className="bg-surface-muted"
                />
                <p className="text-xs text-text-muted mt-1">
                  Email cannot be changed
                </p>
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-spacing-xs"
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
                  className="block font-medium text-text-primary mb-spacing-xs"
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
                  className="block font-medium text-text-primary mb-spacing-xs"
                >
                  Phone Number
                </Typography>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={validationErrors.phone ? "border-red-500" : ""}
                />
                <ValidationError error={validationErrors.phone} />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-spacing-xs"
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
                <p className="text-xs text-text-muted mt-spacing-xs">
                  Role is set by team administrators
                </p>
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-border-light mb-spacing-xs"
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
                className="block font-medium text-text-primary dark:text-border-light mb-spacing-xs"
              >
                Bio
              </Typography>
              <textarea
                rows={4}
                placeholder="Tell us about yourself..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full px-3 py-2 border border-border-medium dark:border-text-tertiary rounded-sm shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-text-primary dark:text-text-inverse font-sans"
              />
            </div>
          </Card>

          {/* Athletic Information - Only show for players */}
          {profile.app_role === "player" && (
            <Card className="p-spacing-xl">
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-success font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Activity className="text-success w-4 h-4" />
                </span>
                Athletic Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-spacing-xs"
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
                    className="block font-medium text-text-primary mb-spacing-xs"
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
                      validationErrors.jersey_number ? "border-red-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.jersey_number} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-spacing-xs"
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
                      validationErrors.height_inches ? "border-red-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.height_inches} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-spacing-xs"
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
                      validationErrors.weight_lbs ? "border-red-500" : ""
                    }
                  />
                  <ValidationError error={validationErrors.weight_lbs} />
                </div>
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-2"
                  >
                    Grade Level
                  </Typography>
                  <select
                    value={formData.grade_level}
                    onChange={(e) =>
                      handleInputChange("grade_level", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-border-medium dark:border-text-tertiary rounded-sm shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-text-primary dark:text-text-inverse font-sans"
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
            <Card className="p-spacing-xl">
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-spacing-lg text-blue-600 font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-spacing-sm">
                  <Trophy className="text-blue-600 w-4 h-4" />
                </span>
                Coaching Information
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-spacing-lg">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-2"
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
                    className="block font-medium text-text-primary mb-2"
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
                    className="block font-medium text-text-primary mb-2"
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
                    className="block font-medium text-text-primary mb-2"
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
                    className="block font-medium text-text-primary mb-2"
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
                    className="w-full px-3 py-2 border border-border-medium dark:border-text-tertiary rounded-sm shadow-sm focus:ring-jade-500 focus:border-jade-500 dark:bg-text-primary dark:text-text-inverse font-sans"
                  />
                </div>
                <div className="md:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-medium text-text-primary mb-2"
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
          <Card className="p-8">
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-6 text-error font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-error/20 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="text-error w-4 h-4" />
              </span>
              Emergency Contact
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-2"
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
                    validationErrors.emergency_contact ? "border-red-500" : ""
                  }
                />
                <ValidationError error={validationErrors.emergency_contact} />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-2"
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
                    validationErrors.emergency_phone ? "border-red-500" : ""
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
            <Card className="relative overflow-hidden p-8">
              <div className="absolute top-0 right-0 w-20 h-20 bg-aurora-emerald rounded-full -mr-10 -mt-10 opacity-60"></div>
              <Typography
                variant="headline-sm"
                as="h2"
                className="mb-6 text-brand-primary font-bold flex items-center"
              >
                <span className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center mr-3">
                  <Trophy className="text-brand-primary w-4 h-4" />
                </span>
                Coaching Information
              </Typography>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="w-full px-3 py-2 border border-border-primary dark:border-border-light rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                    className="w-full px-3 py-2 border border-border-primary dark:border-border-light rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                  />
                </div>
                <div className="lg:col-span-2">
                  <Typography
                    variant="body-sm"
                    as="label"
                    className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
          <Card className="relative overflow-hidden p-8">
            <div className="absolute top-0 left-0 w-16 h-16 bg-brand-secondary/10 rounded-full -ml-8 -mt-8"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-brand-primary/10 rounded-full -mr-6 -mb-6"></div>
            <Typography
              variant="headline-sm"
              as="h2"
              className="mb-6 text-brand-secondary font-bold flex items-center"
            >
              <span className="w-8 h-8 bg-brand-secondary/20 rounded-lg flex items-center justify-center mr-3">
                <Link2 className="text-brand-secondary w-4 h-4" />
              </span>
              Social Media & Links
            </Typography>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
                  className="block font-semibold text-text-primary dark:text-border-light mb-2"
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
          <Card className="p-6">
            <Typography variant="headline-sm" as="h2" className="mb-4">
              Account Security
            </Typography>
            <div className="space-y-4">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-border-light mb-2"
                >
                  Password
                </Typography>
                <div className="flex items-center space-x-4">
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
                <p className="text-xs text-text-muted mt-1">
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
        <div className="mt-8 surface-subtle dark:bg-surface-secondary/50 rounded-lg p-6">
          <Typography variant="headline-sm" as="h3" className="mb-3">
            Account Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
              <div className="inline-flex items-center gap-2">
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
              <code className="text-xs surface-subtle dark:bg-text-primary px-2 py-1 rounded">
                {profile.id.substring(0, 8)}...
              </code>
            </div>
          </div>
        </div>
      </PageLayout>
    </Aurora>
  );
};
