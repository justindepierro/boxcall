import React, { useCallback, useState } from "react";
import { Typography } from "../components/design-system/Typography";
import { Icon } from "../components/ui/Icon/Icon";
import { ProfileForm } from "../features/profile/ProfileForm";
import { ProfileActivity } from "../features/profile/ProfileActivity";
import { useProfileData } from "../features/profile/useProfileData";
import { supabase } from "../lib/supabase";
/**
 * ProfilePage Component
 *
 * User profile management and settings page.
 * Allows users to update their personal information and preferences.
 */
export const ProfilePage: React.FC = () => {
  const { profile, loading } = useProfileData();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [activities] = useState<
    Array<{ id: string; description: string; date: string }>
  >([]); // Placeholder for activity data

  type ProfileFormData = {
    display_name: string;
    full_name: string;
    phone: string;
    bio: string;
    address: string;
  };

  const handleSave = useCallback(
    async (formData: ProfileFormData) => {
      if (!profile) return;
      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", profile.id);
        if (error) {
          setMessage({
            type: "error",
            text: error.message || "Failed to update profile.",
          });
        } else {
          setMessage({
            type: "success",
            text: "Profile updated successfully!",
          });
        }
      } catch {
        setMessage({ type: "error", text: "An unexpected error occurred" });
      }
    },
    [profile]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jade-600"></div>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Typography
            variant="headline-md"
            as="h1"
            className="text-red-600 mb-4"
          >
            Profile Not Found
          </Typography>
          <p className="text-text-secondary">
            Unable to load your profile information.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen surface-app">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="surface-card elevation-card rounded-lg p-6 mb-8">
          <Typography
            variant="headline-lg"
            className="flex items-center mb-2"
            as="h1"
          >
            <Icon name="user" size="xl" className="mr-3" /> My Profile
          </Typography>
          <Typography variant="body-md" color="muted">
            Manage your account information and preferences
          </Typography>
        </div>
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === "success"
                ? "surface-subtle border-subtle text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
                : "surface-subtle border-subtle text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}
        {/* Modular Profile Form */}
        <ProfileForm
          profile={{
            display_name: profile.display_name ?? "",
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            bio: profile.bio ?? "",
            address: profile.address ?? "",
          }}
          loading={loading}
          onSave={handleSave}
        />
        {/* Modular Activity Feed */}
        <div className="mt-8">
          <ProfileActivity activities={activities} />
        </div>
        {/* Account Info */}
        <div className="mt-8 surface-subtle dark:bg-gray-800/50 rounded-lg p-6">
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
              <span className="capitalize">
                {profile.role || "Not assigned"}
              </span>
            </div>
            <div>
              <span className="font-medium">User ID:</span>{" "}
              <code className="text-xs surface-subtle dark:bg-gray-700 px-2 py-1 rounded">
                {profile.id.substring(0, 8)}...
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
