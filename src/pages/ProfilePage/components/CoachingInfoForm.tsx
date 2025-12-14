import React from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Typography } from "../../../components/design-system/Typography";
import { Briefcase } from "lucide-react";

interface CoachingInfoFormProps {
  visible: boolean;
  yearsCoaching: string;
  currentSchool: string;
  coachingExperience: string;
  education: string;
  coachingPhilosophy: string;
  certifications: string;
  onInputChange: (field: string, value: string) => void;
}

export const CoachingInfoForm: React.FC<CoachingInfoFormProps> = ({
  visible,
  yearsCoaching,
  currentSchool,
  coachingExperience,
  education,
  coachingPhilosophy,
  certifications,
  onInputChange,
}) => {
  if (!visible) return null;

  return (
    <Card className="card-blue p-xl rounded-2xl">
      <Typography
        variant="headline-sm"
        as="h2"
        className="mb-lg card-blue-text font-bold flex items-center"
      >
        <span className="w-8 h-8 bg-[var(--card-blue-bg-light)] border-2 border-[var(--card-blue-border)] rounded-lg flex items-center justify-center mr-sm">
          <Briefcase className="card-blue-icon w-4 h-4" />
        </span>
        Coaching Information
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Years Coaching
          </Typography>
          <Input
            type="number"
            placeholder="e.g., 5"
            value={yearsCoaching}
            onChange={(e) => onInputChange("years_coaching", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Current School/Organization
          </Typography>
          <Input
            type="text"
            placeholder="e.g., BoxCall High School"
            value={currentSchool}
            onChange={(e) => onInputChange("current_school", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Coaching Experience
          </Typography>
          <Input
            type="text"
            placeholder="e.g., Offensive Coordinator, Position Coach"
            value={coachingExperience}
            onChange={(e) =>
              onInputChange("coaching_experience", e.target.value)
            }
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Education
          </Typography>
          <Input
            type="text"
            placeholder="e.g., Bachelor's in Sports Science"
            value={education}
            onChange={(e) => onInputChange("education", e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Coaching Philosophy
          </Typography>
          <textarea
            rows={3}
            placeholder="Share your coaching philosophy and approach..."
            value={coachingPhilosophy}
            onChange={(e) =>
              onInputChange("coaching_philosophy", e.target.value)
            }
            className="w-full px-sm py-xs border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus dark:bg-text-primary dark:text-inverse font-sans"
          />
        </div>
        <div className="md:col-span-2">
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Certifications
          </Typography>
          <Input
            type="text"
            placeholder="e.g., NFHS Certified, CPR/First Aid"
            value={certifications}
            onChange={(e) => onInputChange("certifications", e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};
