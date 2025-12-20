import React from "react";
import { Card } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import { Typography } from "../../../../components/design-system/Typography";
import { Link2 } from "lucide-react";

interface SocialMediaFormProps {
  personalWebsite: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  onInputChange: (field: string, value: string) => void;
}

export const SocialMediaForm: React.FC<SocialMediaFormProps> = ({
  personalWebsite,
  twitterUrl,
  instagramUrl,
  linkedinUrl,
  tiktokUrl,
  youtubeUrl,
  onInputChange,
}) => {
  return (
    <Card className="card-indigo relative overflow-hidden p-xl rounded-2xl">
      <div className="absolute top-0 left-0 w-16 h-16 bg-[var(--color-accent-indigo-100)] rounded-full -ml-8 -mt-8 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 bg-[var(--color-accent-indigo-100)] rounded-full -mr-6 -mb-6 opacity-60"></div>
      <Typography
        variant="headline-sm"
        as="h2"
        className="mb-lg card-indigo-text font-bold flex items-center"
      >
        <span className="w-8 h-8 bg-[var(--card-indigo-bg-light)] border-2 border-[var(--card-indigo-border)] rounded-lg flex items-center justify-center mr-sm">
          <Link2 className="card-indigo-icon w-4 h-4" />
        </span>
        Social Media & Links
      </Typography>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            Personal Website
          </Typography>
          <Input
            type="url"
            placeholder="https://www.yourwebsite.com"
            value={personalWebsite}
            onChange={(e) => onInputChange("personal_website", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            Twitter/X
          </Typography>
          <Input
            type="text"
            placeholder="@yourusername or full URL"
            value={twitterUrl}
            onChange={(e) => onInputChange("social_twitter", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            Instagram
          </Typography>
          <Input
            type="text"
            placeholder="@yourusername or full URL"
            value={instagramUrl}
            onChange={(e) => onInputChange("social_instagram", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            LinkedIn
          </Typography>
          <Input
            type="text"
            placeholder="linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => onInputChange("social_linkedin", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            TikTok
          </Typography>
          <Input
            type="text"
            placeholder="@yourusername or full URL"
            value={tiktokUrl}
            onChange={(e) => onInputChange("social_tiktok", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-semibold text-primary dark:text-border-light mb-xs"
          >
            YouTube
          </Typography>
          <Input
            type="text"
            placeholder="youtube.com/@yourchannel"
            value={youtubeUrl}
            onChange={(e) => onInputChange("social_youtube", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
