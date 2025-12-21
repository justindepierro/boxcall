import React, { useState } from "react";
import { Edit2, Save, X } from "lucide-react";
import { Typography } from "../../design-system";
import { Button } from "../../ui";
import { Tooltip } from "../../ui/Tooltip/Tooltip";
import { table } from "../../../data/supabase/db";
import { logError } from "../../../utils/logger";

interface BioSectionProps {
  bio: string | null | undefined;
  profileId: string | undefined;
  isOwnProfile: boolean;
  onBioUpdate: () => Promise<void>;
}

/**
 * Bio Section with Inline Editing
 */
export const BioSection: React.FC<BioSectionProps> = ({
  bio,
  profileId,
  isOwnProfile,
  onBioUpdate,
}) => {
  const [showFullBio, setShowFullBio] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(bio || "");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Update local state when prop changes
  React.useEffect(() => {
    setBioText(bio || "");
  }, [bio]);

  const handleBioSave = async () => {
    if (!profileId) return;

    setIsSavingBio(true);
    try {
      const { error } = await table("profiles")
        .update({ bio: bioText.trim() || null })
        .eq("id", profileId);

      if (error) {
        logError("Error updating bio:", error);
        return;
      }

      await onBioUpdate();
      setIsEditingBio(false);
    } catch (error) {
      logError("Error saving bio:", error);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleBioCancel = () => {
    setBioText(bio || "");
    setIsEditingBio(false);
  };

  return (
    <div className="pt-md relative">
      <div className="bg-muted rounded-lg p-sm border border-muted">
        <div className="flex items-center justify-between mb-xs">
          <Typography
            variant="body-sm"
            className="font-semibold text-brand-secondary"
          >
            About
          </Typography>
          {isOwnProfile && !isEditingBio && (
            <Tooltip content="Edit bio">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingBio(true)}
                className="p-1 hover:bg-brand-secondary/20 hover:shadow-sm rounded-lg transition-all duration-200"
                aria-label="Edit bio"
              >
                <Edit2 className="w-3 h-3 text-brand-secondary" />
              </Button>
            </Tooltip>
          )}
        </div>

        {isEditingBio ? (
          <div className="space-y-xs">
            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Tell others about yourself..."
              className="w-full p-xs text-sm bg-primary border border-primary rounded-lg focus:ring-2 focus:ring-brand-secondary focus:border-transparent resize-none"
              rows={3}
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              <Typography variant="body-xs" className="text-muted">
                {bioText.length}/200
              </Typography>
              <div className="flex items-center space-x-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBioCancel}
                  disabled={isSavingBio}
                  className="p-1 hover:bg-error/10 rounded-lg"
                >
                  <X className="w-3 h-3 text-error" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBioSave}
                  disabled={isSavingBio}
                  className="p-1 hover:bg-success/10 rounded-lg"
                >
                  {isSavingBio ? (
                    <div className="w-3 h-3 border border-success/30 border-t-success rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 text-success" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <BioDisplay
            bio={bio}
            isOwnProfile={isOwnProfile}
            showFullBio={showFullBio}
            onToggle={() => setShowFullBio(!showFullBio)}
          />
        )}
      </div>
    </div>
  );
};

interface BioDisplayProps {
  bio: string | null | undefined;
  isOwnProfile: boolean;
  showFullBio: boolean;
  onToggle: () => void;
}

const BioDisplay: React.FC<BioDisplayProps> = ({
  bio,
  isOwnProfile,
  showFullBio,
  onToggle,
}) => {
  if (!bio) {
    return (
      <Typography variant="body-sm" className="text-muted italic">
        {isOwnProfile
          ? "Click the edit icon to add a bio..."
          : "No bio added yet"}
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="body-sm" className="text-secondary leading-relaxed">
        {showFullBio
          ? bio
          : `${bio.slice(0, 120)}${bio.length > 120 ? "..." : ""}`}
      </Typography>
      {bio.length > 120 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="p-0 h-auto text-xs text-brand-secondary hover:text-brand-secondary/80 mt-xs"
        >
          {showFullBio ? "Show less" : "Show more"}
        </Button>
      )}
    </>
  );
};
