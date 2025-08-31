import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui";
import { Typography } from "../design-system/Typography";
import { ProfileFormSection, type FormValue } from "../forms/ProfileFormFields";
import { getProfileConfigForRole } from "../../types/profileFields";
import { DashboardService } from "../../services/dashboardService";
import { supabase } from "../../lib/supabase";

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
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  userRole,
  currentProfile,
  onProfileUpdate,
}) => {
  const config = getProfileConfigForRole(userRole);
  const [formValues, setFormValues] = useState<Record<string, FormValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Initialize form values from current profile
  useEffect(() => {
    if (currentProfile && isOpen) {
      const initialValues: Record<string, FormValue> = {};

      // Collect all fields from all sections
      const allFields = [
        ...config.basicFields,
        ...(config.athleticFields || []),
        ...(config.academicFields || []),
        ...(config.contactFields || []),
        ...(config.professionalFields || []),
      ];

      allFields.forEach((field) => {
        const value = currentProfile[field.key];
        if (value !== undefined && value !== null) {
          initialValues[field.key] = value as FormValue;
        }
      });

      setFormValues(initialValues);
    }
  }, [currentProfile, isOpen, config]);

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

    const allFields = [
      ...config.basicFields,
      ...(config.athleticFields || []),
      ...(config.academicFields || []),
      ...(config.contactFields || []),
      ...(config.professionalFields || []),
    ];

    allFields.forEach((field) => {
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
      console.error("Avatar upload failed:", error);
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
      console.error("Profile update failed:", error);
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
      title={`Edit ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Profile`}
      size="lg"
      className="max-h-[90vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload Section */}
        <div className="space-y-4">
          <Typography
            variant="headline-sm"
            className="text-text-primary border-b border-subtle pb-2"
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
              <Typography variant="body-xs" className="text-text-muted">
                Upload a new profile picture (JPG, PNG, or GIF)
              </Typography>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <ProfileFormSection
          title="Basic Information"
          fields={config.basicFields}
          values={formValues}
          onChange={handleFieldChange}
          errors={errors}
        />

        {/* Athletic Information (for players) */}
        {config.athleticFields && (
          <ProfileFormSection
            title="Athletic Information"
            fields={config.athleticFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Academic Information (for players) */}
        {config.academicFields && (
          <ProfileFormSection
            title="Academic Information"
            fields={config.academicFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Professional Information (for coaches) */}
        {config.professionalFields && (
          <ProfileFormSection
            title="Professional Information"
            fields={config.professionalFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Contact Information */}
        {config.contactFields && (
          <ProfileFormSection
            title="Contact Information"
            fields={config.contactFields}
            values={formValues}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-subtle">
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
      </form>
    </Modal>
  );
};
