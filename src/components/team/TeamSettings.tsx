import React, { useState } from "react";
import { Icon } from "../ui/Icon/Icon";
import type { TeamSettings as TeamSettingsType } from "../../types/team-management";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

interface TeamSettingsProps {
  teamSettings: TeamSettingsType;
  onUpdate: (settings: TeamSettingsType) => void;
}

/**
 * TeamSettings Component
 *
 * Compact, density-aware team configuration interface.
 */
export const TeamSettings: React.FC<TeamSettingsProps> = ({
  teamSettings,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    name: teamSettings.name,
    school: teamSettings.school || "",
    season: teamSettings.season || "2025",
    logoUrl: teamSettings.logoUrl || "",
    city: teamSettings.location?.city || "",
    state: teamSettings.location?.state || "",
    address: teamSettings.location?.address || "",
    zipCode: teamSettings.location?.zipCode || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updatedSettings: TeamSettingsType = {
        ...teamSettings,
        name: formData.name,
        school: formData.school,
        season: formData.season,
        logoUrl: formData.logoUrl,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      };
      onUpdate(updatedSettings);
      setMessage({
        type: "success",
        text: "Team settings updated successfully!",
      });
    } catch (error) {
      console.error("Error updating team settings:", error);
      setMessage({
        type: "error",
        text: "Failed to update team settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = () => {
    // Placeholder for future upload implementation
    setMessage({
      type: "success",
      text: "Logo upload feature coming soon!",
    });
  };

  return (
    <div className="surface-card rounded-lg shadow-sm">
      {/* Header */}
      <div className="bc-card-padding border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-text-primary">
          Team Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your team information and preferences
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className="bc-card-padding">
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
                : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bc-card-padding space-y-8">
        {/* Team Logo */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Team Logo
          </h3>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {teamSettings.logoUrl ? (
                <img
                  src={teamSettings.logoUrl}
                  alt={`${teamSettings.name} logo`}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-300 dark:border-gray-600">
                  <Icon name="award" className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogoUpload}
              >
                📸 Upload Logo
              </Button>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or SVG. Max file size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Team Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Wildcats"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                School/Organization
              </label>
              <Input
                type="text"
                value={formData.school}
                onChange={(e) => handleInputChange("school", e.target.value)}
                placeholder="Lincoln High School"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Season
              </label>
              <Input
                type="text"
                value={formData.season}
                onChange={(e) => handleInputChange("season", e.target.value)}
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Logo URL
              </label>
              <Input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Location Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Address
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                City
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Lincoln"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                State
              </label>
              <Input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Nebraska"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                ZIP Code
              </label>
              <Input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                placeholder="68501"
              />
            </div>
          </div>
        </div>

        {/* Subscription Information */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Subscription Status
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary capitalize">
                  {teamSettings.subscription.tier} Plan
                </p>
                <p className="text-sm text-text-secondary">
                  Features: {teamSettings.subscription.features.join(", ")}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Team ID */}
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">
            Team Information
          </h3>
          <div className="bg-jade-50 dark:bg-navy-900/20 rounded-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">
                  Team ID:{" "}
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded-sm text-jade-600 font-mono">
                    {teamSettings.id}
                  </code>
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Internal team identifier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
};
