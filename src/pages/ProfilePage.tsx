import React from "react";
import { useAuth, useAuthLoading, useAuthProfile } from "../app/auth-store";
import { Typography } from "../components/design-system/Typography";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { debug } from "../utils/logger";
import { ProfilePageContent } from "./ProfilePage/components/ProfilePageContent";
import {
  useProfileForm,
  useProfileAvatar,
  useProfileSave,
} from "./ProfilePage/hooks";

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

  // Form state and validation
  const { formData, validationErrors, handleInputChange, validateForm } =
    useProfileForm(profile);

  // Avatar handling
  const {
    avatarFile,
    avatarUploading,
    showAvatarEditor,
    fileInputRef,
    setAvatarFile,
    setShowAvatarEditor,
    handleAvatarUpload,
    handleCroppedAvatar,
    handleEditCurrentAvatar,
  } = useProfileAvatar(profile, fetchUserProfile, (msg) => setMessage(msg));

  // Save handling
  const {
    saving,
    message,
    setMessage,
    handleSaveProfile,
    handlePasswordChange,
  } = useProfileSave(profile, fetchUserProfile, setAvatarFile);

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
    <ProfilePageContent
      profile={profile}
      formData={formData}
      validationErrors={validationErrors}
      message={message}
      saving={saving}
      avatarFile={avatarFile}
      avatarUploading={avatarUploading}
      showAvatarEditor={showAvatarEditor}
      fileInputRef={fileInputRef}
      onInputChange={handleInputChange}
      onSaveProfile={(e) =>
        handleSaveProfile(
          e,
          formData,
          validateForm,
          handleAvatarUpload,
          avatarFile
        )
      }
      onPasswordChange={handlePasswordChange}
      onUploadClick={() => {
        debug("Upload Picture clicked");
        fileInputRef.current?.click();
      }}
      onEditClick={() => {
        if (profile.avatar_url) {
          handleEditCurrentAvatar(profile.avatar_url);
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
      setAvatarFile={setAvatarFile}
      setShowAvatarEditor={setShowAvatarEditor}
      onCroppedAvatar={handleCroppedAvatar}
    />
  );
};

ProfilePage.displayName = "ProfilePage";

export default React.memo(ProfilePage);
