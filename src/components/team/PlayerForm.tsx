import React, { useEffect, useState } from "react";
import type { TeamPlayer, TeamPlayerInsert } from "../../types/team-management";
import { FOOTBALL_POSITIONS, TEAM_LEVELS } from "../../types/team-management";
import { Button } from "../ui/Button";
import { Typography } from "../design-system/Typography";
import { Input } from "../ui/Input";
interface PlayerFormProps {
  player?: TeamPlayer | null;
  teamId: string;
  onSave: (player: TeamPlayer) => void;
  onCancel: () => void;
}
/**
 * PlayerForm Component
 *
 * Modal form for adding or editing team players.
 * Includes all player fields with validation.
 */
export const PlayerForm: React.FC<PlayerFormProps> = ({
  player,
  teamId,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<Partial<TeamPlayerInsert>>({
    team_id: teamId,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    parent_email: "",
    positions: [],
    jersey_number: undefined,
    height: "",
    weight: undefined,
    graduation_year: undefined,
    team_level: "varsity",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  // Load player data if editing
  useEffect(() => {
    if (player) {
      setFormData({
        ...player,
        team_id: teamId,
      });
    }
  }, [player, teamId]);
  // Handle input changes
  const handleInputChange = (
    field: keyof TeamPlayerInsert,
    value: string | number | string[] | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };
  // Handle position selection
  const handlePositionToggle = (position: string) => {
    const currentPositions = formData.positions || [];
    const newPositions = currentPositions.includes(position)
      ? currentPositions.filter((p) => p !== position)
      : [...currentPositions, position];
    handleInputChange("positions", newPositions);
  };
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (
      formData.parent_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parent_email)
    ) {
      newErrors.parent_email = "Please enter a valid parent email address";
    }
    if (!formData.positions || formData.positions.length === 0) {
      newErrors.positions = "Please select at least one position";
    }
    if (formData.jersey_number !== undefined) {
      if (formData.jersey_number < 0 || formData.jersey_number > 99) {
        newErrors.jersey_number = "Jersey number must be between 0 and 99";
      }
    }
    if (formData.weight !== undefined && formData.weight <= 0) {
      newErrors.weight = "Weight must be a positive number";
    }
    if (formData.graduation_year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (
        formData.graduation_year < currentYear ||
        formData.graduation_year > currentYear + 10
      ) {
        newErrors.graduation_year = `Graduation year must be between ${currentYear} and ${currentYear + 10}`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSaving(true);
    try {
      const playerData: TeamPlayer = {
        id: player?.id || Date.now().toString(),
        team_id: teamId,
        first_name: formData.first_name!,
        last_name: formData.last_name!,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        parent_email: formData.parent_email || undefined,
        positions: formData.positions!,
        jersey_number: formData.jersey_number,
        height: formData.height || undefined,
        weight: formData.weight,
        graduation_year: formData.graduation_year,
        team_level: formData.team_level!,
        created_at: player?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      onSave(playerData);
    } catch (error) {
      console.error("Error saving player:", error);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="surface-card elevation-modal rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bc-card-padding border-b border-subtle dark:border-gray-700">
          <Typography variant="headline-sm" as="h2">
            {player ? "Edit Player" : "Add New Player"}
          </Typography>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="bc-card-padding space-y-6">
          {/* Basic Information */}
          <div>
            <Typography variant="headline-sm" as="h3" className="mb-4">
              Basic Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 bc-grid-gap">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  First Name *
                </Typography>
                <Input
                  type="text"
                  value={formData.first_name || ""}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  placeholder="John"
                />
                {errors.first_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.first_name}
                  </p>
                )}
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Last Name *
                </Typography>
                <Input
                  type="text"
                  value={formData.last_name || ""}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  placeholder="Smith"
                />
                {errors.last_name && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.last_name}
                  </p>
                )}
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Email
                </Typography>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john.smith@email.com"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Phone Number
                </Typography>
                <Input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Parent Email
                </Typography>
                <Input
                  type="email"
                  value={formData.parent_email || ""}
                  onChange={(e) =>
                    handleInputChange("parent_email", e.target.value)
                  }
                  placeholder="parent@email.com"
                />
                {errors.parent_email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.parent_email}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Positions */}
          <div>
            <Typography
              variant="headline-sm"
              as="h3"
              className="mb-4 text-text-primary"
            >
              Positions *
            </Typography>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {FOOTBALL_POSITIONS.map((position) => (
                <Button
                  key={position}
                  type="button"
                  size="sm"
                  variant={
                    formData.positions?.includes(position) ? "primary" : "ghost"
                  }
                  className={
                    formData.positions?.includes(position)
                      ? ""
                      : "surface-subtle dark:bg-gray-700 surface-subtle-hover dark:hover:bg-gray-600 text-text-secondary dark:text-gray-300"
                  }
                  onClick={() => handlePositionToggle(position)}
                >
                  {position}
                </Button>
              ))}
            </div>
            {errors.positions && (
              <p className="text-red-600 text-sm mt-2">{errors.positions}</p>
            )}
          </div>
          {/* Physical Information */}
          <div>
            <Typography
              variant="headline-sm"
              as="h3"
              className="mb-4 text-text-primary"
            >
              Physical Information
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-4 bc-grid-gap">
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Jersey Number
                </Typography>
                <Input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.jersey_number || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "jersey_number",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="12"
                />
                {errors.jersey_number && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.jersey_number}
                  </p>
                )}
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Height
                </Typography>
                <Input
                  type="text"
                  value={formData.height || ""}
                  onChange={(e) => handleInputChange("height", e.target.value)}
                  placeholder="6'2&quot;"
                />
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Weight (lbs)
                </Typography>
                <Input
                  type="number"
                  min="1"
                  value={formData.weight || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "weight",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="185"
                />
                {errors.weight && (
                  <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
                )}
              </div>
              <div>
                <Typography
                  variant="body-sm"
                  as="label"
                  className="block font-medium text-text-primary dark:text-gray-300 mb-1"
                >
                  Graduation Year
                </Typography>
                <Input
                  type="number"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  value={formData.graduation_year || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "graduation_year",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="2026"
                />
                {errors.graduation_year && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.graduation_year}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Team Level */}
          <div>
            <Typography
              variant="headline-sm"
              as="h3"
              className="mb-4 text-text-primary"
            >
              Team Level
            </Typography>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TEAM_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  type="button"
                  size="sm"
                  variant={
                    formData.team_level === level.value ? "secondary" : "ghost"
                  }
                  className={
                    formData.team_level === level.value
                      ? ""
                      : "surface-card text-text-primary border-subtle surface-subtle-hover"
                  }
                  onClick={() => handleInputChange("team_level", level.value)}
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-subtle dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              {saving ? "Saving..." : player ? "Update Player" : "Add Player"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
