/**
 * ProfilePageContent - Main content section for profile page
 */
import React from "react";
import type { Database } from "../../../../types/database";
import type {
  ProfileFormData,
  ValidationErrors,
} from "../../hooks/page";
import { Button } from "../../../../components/ui/Button";
import { Typography } from "../../../../components/design-system/Typography";
import { MultiBadgeDisplay } from "../../../../components/ui/MultiBadgeDisplay";
import { AvatarEditor } from "../../../../components/profile/AvatarEditor";
import { debug } from "../../../../utils/logger";

type BaseProfile = Database["public"]["Tables"]["profiles"]["Row"];

// Extended profile type with additional fields that may not be in generated types yet
type Profile = BaseProfile & {
  is_admin?: boolean | null;
  app_role?: string | null;
  subscription_tier?: string | null;
};

import { ProfileAvatar } from "./ProfileAvatar";
import { BasicInfoForm } from "./BasicInfoForm";
import { AthleticInfoForm } from "./AthleticInfoForm";
import { CoachingInfoForm } from "./CoachingInfoForm";
import { EmergencyContactForm } from "./EmergencyContactForm";
import { SocialMediaForm } from "./SocialMediaForm";
import { AccountSecurityForm } from "./AccountSecurityForm";

/** Get save button text based on state */
const getSaveButtonText = (
  saving: boolean,
  avatarUploading: boolean
): string => {
  if (saving && avatarUploading) return "Uploading...";
  if (saving) return "Saving...";
  return "Save Changes";
};

interface ProfilePageContentProps {
  profile: Profile;
  formData: ProfileFormData;
  validationErrors: ValidationErrors;
  message: { type: "success" | "error"; text: string } | null;
  saving: boolean;
  avatarFile: File | null;
  avatarUploading: boolean;
  showAvatarEditor: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (field: string, value: string) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onPasswordChange: () => void;
  onUploadClick: () => void;
  onEditClick: () => void;
  onFileSelect: (file: File | null) => void;
  setAvatarFile: (file: File | null) => void;
  setShowAvatarEditor: (show: boolean) => void;
  onCroppedAvatar: (blob: Blob) => void;
}

export const ProfilePageContent: React.FC<ProfilePageContentProps> = ({
  profile,
  formData,
  validationErrors,
  message,
  saving,
  avatarFile,
  avatarUploading,
  showAvatarEditor,
  fileInputRef,
  onInputChange,
  onSaveProfile,
  onPasswordChange,
  onUploadClick,
  onEditClick,
  onFileSelect,
  setAvatarFile,
  setShowAvatarEditor,
  onCroppedAvatar,
}) => {
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
        <form onSubmit={onSaveProfile} className="space-y-lg">
          <ProfileAvatar
            avatarUrl={profile.avatar_url}
            displayName={profile.display_name}
            fullName={profile.full_name}
            avatarFile={avatarFile}
            onUploadClick={onUploadClick}
            onEditClick={onEditClick}
            onFileSelect={onFileSelect}
            fileInputRef={fileInputRef}
          />

          <BasicInfoForm
            email={profile.email || ""}
            displayName={formData.display_name}
            fullName={formData.full_name}
            phone={formData.phone}
            address={formData.address}
            bio={formData.bio}
            isAdmin={profile.is_admin ?? false}
            appRole={profile.app_role || profile.role || ""}
            subscriptionTier={profile.subscription_tier ?? "free"}
            validationErrors={validationErrors}
            onInputChange={onInputChange}
          />

          <AthleticInfoForm
            visible={profile.app_role === "player"}
            position={formData.position}
            jerseyNumber={formData.jersey_number}
            heightInches={formData.height_inches}
            weight={formData.weight_lbs}
            gradeLevel={formData.grade_level}
            validationErrors={validationErrors}
            onInputChange={onInputChange}
          />

          <CoachingInfoForm
            visible={
              profile.app_role === "coach" ||
              profile.app_role === "free_coach" ||
              profile.app_role === "head_coach" ||
              (profile.is_admin ?? false)
            }
            yearsCoaching={formData.years_coaching}
            currentSchool={formData.current_school}
            coachingExperience={formData.coaching_experience}
            education={formData.education}
            coachingPhilosophy={formData.coaching_philosophy}
            certifications={formData.certifications}
            onInputChange={onInputChange}
          />

          <EmergencyContactForm
            emergencyContactName={formData.emergency_contact}
            emergencyPhone={formData.emergency_phone}
            validationErrors={validationErrors}
            onInputChange={onInputChange}
          />

          <SocialMediaForm
            personalWebsite={formData.personal_website}
            twitterUrl={formData.social_twitter}
            instagramUrl={formData.social_instagram}
            linkedinUrl={formData.social_linkedin}
            tiktokUrl={formData.social_tiktok}
            youtubeUrl={formData.social_youtube}
            onInputChange={onInputChange}
          />

          <AccountSecurityForm onChangePasswordClick={onPasswordChange} />

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
              {getSaveButtonText(saving, avatarUploading)}
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
              onSave={onCroppedAvatar}
            />
          </>
        )}
      </div>
    </div>
  );
};
