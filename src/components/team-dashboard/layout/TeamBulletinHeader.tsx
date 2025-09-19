import React, { useRef, useState } from "react";

import { supabase } from "../../../lib/supabase";
import { Typography } from "../../design-system";
import { LogoIcon } from "../../ui/Logo";
import { Button } from "../../ui/Button"; // Import the shared Button component

// Removed old inline edit button import usage after redesign

export interface TeamBulletinHeaderProps {
  teamId: string | undefined;
  teamName: string;
  seasonDisplay: string;
  record: { wins: number; losses: number };
  memberCount: number;
  nextGame: string;
  schoolName?: string | null;
  mascot?: string | null;
  isCoach: boolean;
  logoUrl?: string | null;
  /** Optional id for main heading to support aria-labelledby on main */
  headingId?: string;
}

export const TeamBulletinHeader: React.FC<TeamBulletinHeaderProps> = ({
  teamId,
  teamName,
  seasonDisplay,
  record,
  memberCount,
  nextGame,
  schoolName,
  mascot,
  isCoach,
  logoUrl,
  headingId,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localLogo, setLocalLogo] = useState<string | null>(logoUrl || null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !e.target.files[0] || !teamId) return;
    const file = e.target.files[0];
    const ext = file.name.split(".").pop();
    const filePath = `team-${teamId}/${crypto.randomUUID()}.${ext}`;
    try {
      setUploading(true);
      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: pub } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);
      const publicUrl = pub.publicUrl;
      // Persist on team row
      const { error: updateError } = await supabase
        .from("teams")
        .update({ logo_url: publicUrl })
        .eq("id", teamId);
      if (updateError) throw updateError;
      setLocalLogo(publicUrl);
    } catch (_err) {
      // console.warn("team.logo.upload.error", err);
      // Simple fallback: revert input value
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-[#FCFDFC] dark:bg-gray-800 border border-subtle dark:border-gray-700 rounded-none mb-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Team Logo / Uploader */}
          <div className="relative group">
            {/* MIGRATION: Replace raw <button> with shared Button for a11y, style, and semantic tokens */}
            <Button
              variant={localLogo ? "secondary" : "outline"}
              size="lg"
              disabled={!isCoach || uploading}
              onClick={() => fileInputRef.current?.click()}
              aria-label={
                isCoach
                  ? localLogo
                    ? "Change team logo"
                    : "Upload team logo"
                  : "Team logo"
              }
              className={
                localLogo
                  ? "w-20 h-20 rounded-none border-subtle dark:border-gray-600 surface-subtle dark:bg-gray-700 overflow-hidden"
                  : "w-20 h-20 rounded-none border-gray-300 dark:border-gray-600 surface-subtle dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
              }
            >
              {localLogo ? (
                <img
                  src={localLogo}
                  alt={`${teamName} logo`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-center flex flex-col items-center text-text-secondary dark:text-gray-300">
                  <LogoIcon size="lg" color="brand" />
                  <span className="text-[10px] font-medium mt-1">
                    {uploading ? "Uploading..." : isCoach ? "Add Logo" : "Logo"}
                  </span>
                </div>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {!isCoach && !localLogo && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-gray-800 text-text-inverse text-xs py-1 px-2 rounded whitespace-nowrap">
                  Coaches can add team logo
                </div>
              </div>
            )}
          </div>
          <div>
            <Typography
              variant="headline-xl"
              as="h1"
              id={headingId}
              className="text-text-primary"
            >
              {teamName}
            </Typography>
            <Typography
              variant="body-lg"
              className="mt-0.5 text-text-secondary dark:text-gray-300"
            >
              {seasonDisplay} • Record: {record.wins}-{record.losses}
            </Typography>
            {schoolName && (
              <div className="text-xs text-text-secondary dark:text-gray-300 mt-1">
                {schoolName}
                {mascot ? ` ${mascot}` : ""}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <Typography
              variant="body-sm"
              className="text-text-secondary dark:text-gray-300"
            >
              Next Game
            </Typography>
            <Typography
              variant="body-md"
              className="font-semibold text-text-primary"
            >
              {nextGame}
            </Typography>
          </div>
          <div className="text-right">
            <Typography
              variant="body-sm"
              className="text-text-secondary dark:text-gray-300"
            >
              Team Members
            </Typography>
            <Typography
              variant="body-md"
              className="font-semibold text-text-primary"
            >
              {memberCount}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
