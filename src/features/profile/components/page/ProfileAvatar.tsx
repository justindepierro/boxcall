import React from "react";
import { Button } from "../../../../components/ui/Button";
import { Typography } from "../../../../components/design-system/Typography";
import { Camera, Pencil } from "lucide-react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  displayName: string | null;
  fullName: string | null;
  avatarFile: File | null;
  onUploadClick: () => void;
  onEditClick: () => void;
  onFileSelect: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  displayName,
  fullName,
  avatarFile,
  onUploadClick,
  onEditClick,
  onFileSelect,
  fileInputRef,
}) => {
  return (
    <div className="relative overflow-hidden bg-aurora-shell rounded-aurora p-xl shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-secondary/10 rounded-full -ml-12 -mb-12"></div>
      <div className="relative">
        <Typography
          variant="headline-sm"
          as="h2"
          className="mb-lg text-brand-primary font-bold flex items-center"
        >
          <span className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center mr-sm">
            <Camera className="text-brand-primary w-4 h-4" />
          </span>
          Profile Picture
        </Typography>
        <div className="flex items-center space-x-lg">
          <div className="relative">
            {/* Avatar Container */}
            <div className="w-32 h-32 rounded-2xl bg-aurora-emerald p-xs shadow-lg">
              <div className="w-full h-full rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Typography
                    variant="headline-xl"
                    className="text-muted font-bold"
                  >
                    {fullName?.charAt(0) || displayName?.charAt(0) || "U"}
                  </Typography>
                )}
              </div>
            </div>

            {/* Success Badge */}
            {avatarFile && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-bg-primary">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
            )}
          </div>
          <div className="flex-1">
            {/* Upload Info */}
            <Typography variant="body-md" className="font-medium mb-xs">
              Your Profile Picture
            </Typography>
            <Typography variant="body-sm" className="text-muted mb-md">
              Upload a new picture or edit your existing one
            </Typography>

            {/* Action Buttons */}
            <div className="flex gap-sm mb-sm">
              <Button variant="primary" size="sm" onClick={onUploadClick}>
                <Camera className="w-4 h-4 mr-2" />
                Upload Picture
              </Button>

              {avatarUrl && (
                <Button variant="outline" size="sm" onClick={onEditClick}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Current
                </Button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onFileSelect(file);
                // Reset input
                if (e.target) e.target.value = "";
              }}
              className="hidden"
            />

            <Typography variant="body-xs" className="text-tertiary">
              JPG, PNG, or GIF • Max 5MB • Square images work best
            </Typography>
            {avatarFile && (
              <div className="mt-xs p-xs bg-success/10 border border-success/20 rounded-lg">
                <Typography
                  variant="body-xs"
                  className="text-success font-medium"
                >
                  ✓ Ready to upload: {avatarFile.name}
                </Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
