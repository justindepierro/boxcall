import React, { useEffect, useState } from "react";
import { useAuth, useAuthLoading, useAuthProfile } from "../app/auth-store";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Typography } from "../components/design-system/Typography";
import { supabase } from "../lib/supabase";
import { PageLayout } from "../components/layout/PageLayout";
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
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  // Form state
  const [formData, setFormData] = useState({
    display_name: "",
    full_name: "",
    phone: "",
    bio: "",
    address: "",
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
      });
    }
  }, [profile]);
  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: formData.display_name || null,
          full_name: formData.full_name || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
          address: formData.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);
      if (error) {
        setMessage({
          type: "error",
          text: "Failed to update profile: " + error.message,
        });
      } else {
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
      <PageLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-primary"></div>
        </div>
      </PageLayout>
    );
  }
  if (!profile) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <Typography variant="headline-md" as="h1" className="text-error mb-4">
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
    <PageLayout
      title="My Profile"
      subtitle="Manage your account information and preferences"
      variant="form"
    >
      {/* Message Display */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-success-bg border-success text-success"
              : "bg-error-bg border-error text-error"
          }`}
        >
          {message.text}
        </div>
      )}
      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-surface-primary border border-border rounded-lg p-6">
          <Typography variant="headline-sm" as="h2" className="mb-4">
            Basic Information
          </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="block font-medium text-text-primary mb-2"
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
                  className="block font-medium text-text-primary mb-2"
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
                  className="block font-medium text-text-primary mb-2"
                >
                  Phone Number
                </Typography>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary mb-2"
                >
                  Role
                </Typography>
                <Input
                  type="text"
                  value={profile.role || "Not specified"}
                  disabled
                  className="bg-surface-muted capitalize"
                />
                <p className="text-xs text-text-muted mt-1">
                  Role is set by team administrators
                </p>
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-border-light mb-2"
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
            <div className="mt-6">
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-text-primary dark:text-border-light mb-2"
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
          </div>
          {/* Account Security */}
          <div className="surface-card elevation-card rounded-lg p-6">
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
          </div>
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
              loading={saving}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
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
              <span className="capitalize">
                {profile.role || "Not assigned"}
              </span>
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
  );
};
