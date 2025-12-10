import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../ui/Modal";
import { useMobileModal } from "../../hooks/useMobileModal";
import { Button } from "../ui";
import { Typography } from "../design-system/Typography";
import { ProfileFormSection, type FormValue } from "../forms/ProfileFormFields";
import { getProfileConfigForRole } from "../../types/profileFields";
import { DashboardService } from "@services/dashboardService";
import { supabase } from "../../lib/supabase";
import { logError } from "../../utils/logger";

interface ProfileData {
  id: string;
  [key: string]: unknown; // Allow any profile fields
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
  currentProfile: ProfileData;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  mode?: "quick" | "full";
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userRole,
  currentProfile,
  onProfileUpdate,
  mode = "full",
}) => {
  const config = getProfileConfigForRole(userRole);
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const modalSize = useMobileModal("lg");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Determine visible fields based on mode
  const quickFieldKeys = useMemo(() => ["display_name", "bio"], []);
  const basicQuickFields = useMemo(
    () => config.basicFields.filter((f) => quickFieldKeys.includes(f.key)),
    [config.basicFields, quickFieldKeys]
  );
  const allFieldsCombined = useMemo(
    () => [
      ...config.basicFields,
      ...(config.athleticFields || []),
      ...(config.academicFields || []),
      ...(config.contactFields || []),
      ...(config.professionalFields || []),
    ],
    [config]
  );
  const fieldsForRender =
    mode === "quick" ? basicQuickFields : allFieldsCombined;

  // Initialize form values from current profile (only for visible fields)
  useEffect(() => {
    if (currentProfile && isOpen) {
      const initialValues: Record<string, FormValue> = {};
      fieldsForRender.forEach((field) => {
        const value = currentProfile[field.key];
        if (value !== undefined && value !== null) {
          initialValues[field.key] = value as FormValue;
        }
      });

      setFormValues(initialValues);
    }
  }, [currentProfile, isOpen, fieldsForRender]);

  const handleFieldChange = (key: string, value: FormValue) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    fieldsForRender.forEach((field) => {
      if (
        field.required &&
        (!formValues[field.key] || formValues[field.key] === "")
      ) {
        newErrors[field.key] = `${field.label} is required`;
      }

      // Type-specific validation
      if (formValues[field.key] && field.validation) {
        const value = formValues[field.key];

        if (field.type === "number" && typeof value === "number") {
          if (
            field.validation.min !== undefined &&
            value < field.validation.min
          ) {
            newErrors[field.key] =
              `${field.label} must be at least ${field.validation.min}`;
          }
          if (
            field.validation.max !== undefined &&
            value > field.validation.max
          ) {
            newErrors[field.key] =
              `${field.label} must be no more than ${field.validation.max}`;
          }
        }

        if (field.type === "email" && typeof value === "string") {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors[field.key] = "Please enter a valid email address";
          }
        }

        if (field.type === "url" && typeof value === "string") {
          try {
            new URL(value);
          } catch {
            newErrors[field.key] = "Please enter a valid URL";
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAvatarUpload = async (): Promise<string | null> => {
    if (!avatarFile || !currentProfile?.id) return null;

    setAvatarUploading(true);
    try {
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("avatars")
        .upload(`${currentProfile.id}/${avatarFile.name}`, avatarFile, {
          upsert: true,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(`${currentProfile.id}/${avatarFile.name}`);

      return urlData?.publicUrl || null;
    } catch (error) {
      logError("Avatar upload failed:", error);
      return null;
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!currentProfile?.id) return;

    setIsSubmitting(true);
    try {
      // Handle avatar upload if present
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload();
        if (avatarUrl) {
          formValues.avatar_url = avatarUrl;
        }
      }

      // Update profile in database
      const updatedProfile = await DashboardService.updateUserProfile(
        currentProfile.id,
        formValues as Record<string, string | number | boolean>
      );

      if (updatedProfile) {
        onProfileUpdate(updatedProfile);
        onClose();
      }
    } catch (error) {
      logError("Profile update failed:", error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormValues({});
    setErrors({});
    setAvatarFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        mode === "quick"
          ? "Quick Edit Profile"
          : `Edit ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile`
      }
      size={modalSize}
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="space-y-4">
          <Typography
            variant="headline-sm"
            className="text-primary border-b border-muted pb-2"
          >
            Profile Picture
          </Typography>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full bg-jade-100 flex items-center justify-center overflow-hidden">
              {currentProfile?.avatar_url &&
              typeof currentProfile.avatar_url === "string" ? (
                <img
                  src={currentProfile.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Typography variant="headline-sm" className="text-jade-800">
                  {(typeof currentProfile?.full_name === "string" &&
                    currentProfile.full_name.charAt(0)) ||
                    "U"}
                </Typography>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              <Typography variant="body-xs" className="text-muted">
                Upload a new profile picture (JPG, PNG, or GIF)
              </Typography>
            </div>
          </div>
        </div>

        {/* Fields */}
        {mode === "quick" ? (
          <ProfileFormSection
            title="Quick Details"
            fields={basicQuickFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        ) : (
          <ProfileFormSection
            title="Basic Information"
            fields={config.basicFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Athletic Information (for players) */}
        {mode === "full" && config.athleticFields && (
          <ProfileFormSection
            title="Athletic Information"
            fields={config.athleticFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Academic Information (for players) */}
        {mode === "full" && config.academicFields && (
          <ProfileFormSection
            title="Academic Information"
            fields={config.academicFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Professional Information (for coaches) */}
        {mode === "full" && config.professionalFields && (
          <ProfileFormSection
            title="Professional Information"
            fields={config.professionalFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Contact Information */}
        {mode === "full" && config.contactFields && (
          <ProfileFormSection
            title="Contact Information"
            fields={config.contactFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-muted gap-3">
          {mode === "quick" && (
            <Button
              type="button"
              variant="infoLink"
              onClick={() => navigate("/profile")}
            >
              Manage account settings
            </Button>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || avatarUploading}
            >
              {isSubmitting || avatarUploading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
