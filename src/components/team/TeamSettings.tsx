import React, { useState, useCallback, useEffect, useRef } from "react";
import { Icon } from "../ui/Icon/Icon";
import type { TeamSettings as TeamSettingsType } from "../../types/team-management";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Typography } from "../design-system/Typography";
import { useSaveState } from "../../hooks/useSaveState";

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

  // Global save indicator
  const { startSaving, finishSaving } = useSaveState();

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save function with global indicator
  const autoSave = useCallback(
    async (updatedFormData: typeof formData) => {
      startSaving();
      setSaving(true);
      setMessage(null);

      try {
        const updatedSettings: TeamSettingsType = {
          ...teamSettings,
          name: updatedFormData.name,
          school: updatedFormData.school,
          season: updatedFormData.season,
          logoUrl: updatedFormData.logoUrl,
          location: {
            address: updatedFormData.address,
            city: updatedFormData.city,
            state: updatedFormData.state,
            zipCode: updatedFormData.zipCode,
          },
        };

        onUpdate(updatedSettings);
        finishSaving("success");
      } catch (error) {
        console.error("Error auto-saving team settings:", error);
        finishSaving("error");
      } finally {
        setSaving(false);
      }
    },
    [teamSettings, onUpdate, startSaving, finishSaving]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for auto-save (500ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      autoSave(updatedFormData);
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear debounce timer if manual save triggered
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Use auto-save function for consistency
    await autoSave(formData);

    // Show success message for manual save
    setMessage({
      type: "success",
      text: "Team settings updated successfully!",
    });
  };

  const handleLogoUpload = () => {
    // Placeholder for future upload implementation
    setMessage({
      type: "success",
      text: "Logo upload feature coming soon!",
    });
  };

  return (
    <div className="bg-surface-primary rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6">
        <Typography variant="headline-sm" as="h2" className="text-primary">
          Team Settings
        </Typography>
        <Typography variant="body-sm" color="muted" className="mt-1">
          Configure your team information and preferences
        </Typography>
      </div>

      {/* Message */}
      {message && (
        <div className="p-6">
          <div
            className={`p-4 rounded-lg border ${
              message.type === "success"
                ? "surface-subtle border-subtle text-success"
                : "surface-subtle border-subtle text-error"
            }`}
          >
            {message.text}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Team Logo */}
        <div>
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-4"
          >
            Team Logo
          </Typography>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {teamSettings.logoUrl ? (
                <img
                  src={teamSettings.logoUrl}
                  alt={`${teamSettings.name} logo`}
                  className="w-24 h-24 rounded-lg object-cover border border-medium dark:border-text-tertiary"
                />
              ) : (
                <div className="w-24 h-24 surface-subtle dark:bg-surface-secondary rounded-lg flex items-center justify-center border border-medium dark:border-text-tertiary">
                  <Icon name="award" className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={handleLogoUpload}
              >
                <Icon
                  name="camera"
                  className="inline h-4 w-4 align-middle text-primary"
                />{" "}
                Upload Logo
              </Button>
              <p className="text-xs text-muted mt-1">
                JPG, PNG or SVG. Max file size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-4"
          >
            Basic Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Team Name *
              </Typography>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Wildcats"
                required
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                School/Organization
              </Typography>
              <Input
                type="text"
                value={formData.school}
                onChange={(e) => handleInputChange("school", e.target.value)}
                placeholder="Lincoln High School"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Season
              </Typography>
              <Input
                type="text"
                value={formData.season}
                onChange={(e) => handleInputChange("season", e.target.value)}
                placeholder="2025"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Logo URL
              </Typography>
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
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-4"
          >
            Location Information
          </Typography>
          <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap">
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                Address
              </Typography>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                City
              </Typography>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="Lincoln"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                State
              </Typography>
              <Input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder="Nebraska"
              />
            </div>
            <div>
              <Typography
                variant="body-sm"
                as="label"
                className="block font-medium text-secondary mb-2"
              >
                ZIP Code
              </Typography>
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
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-4"
          >
            Subscription Status
          </Typography>
          <div className="surface-subtle dark:bg-surface-secondary rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary capitalize">
                  {teamSettings.subscription.tier} Plan
                </p>
                <p className="text-sm text-secondary">
                  Features: {teamSettings.subscription.features.join(", ")}
                </p>
              </div>
              <Button variant="secondary" size="sm">
                Manage Subscription
              </Button>
            </div>
          </div>
        </div>

        {/* Team ID */}
        <div>
          <Typography
            variant="headline-sm"
            as="h3"
            className="text-primary mb-4"
          >
            Team Information
          </Typography>
          <div className="surface-subtle dark:bg-navy-900/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary">
                  Team ID:{" "}
                  <code className="surface-subtle px-2 py-1 rounded-lg text-jade-600 font-mono">
                    {teamSettings.id}
                  </code>
                </p>
                <p className="text-sm text-secondary mt-1">
                  Internal team identifier
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-subtle dark:border-text-tertiary">
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
