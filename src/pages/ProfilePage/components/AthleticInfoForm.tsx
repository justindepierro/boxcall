import React from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { FormSelect } from "../../../components/ui";
import { Typography } from "../../../components/design-system/Typography";
import { Activity } from "lucide-react";

interface ValidationError {
  height_inches?: string;
  weight_lbs?: string;
  jersey_number?: string;
}

interface AthleticInfoFormProps {
  visible: boolean;
  position: string;
  jerseyNumber: string;
  heightInches: string;
  weight: string;
  gradeLevel: string;
  validationErrors: ValidationError;
  onInputChange: (field: string, value: string) => void;
}

const ValidationErrorDisplay: React.FC<{ error?: string }> = ({ error }) => {
  if (!error) return null;
  return (
    <Typography variant="body-xs" className="text-error mt-1">
      {error}
    </Typography>
  );
};

export const AthleticInfoForm: React.FC<AthleticInfoFormProps> = ({
  visible,
  position,
  jerseyNumber,
  heightInches,
  weight,
  gradeLevel,
  validationErrors,
  onInputChange,
}) => {
  if (!visible) return null;

  return (
    <Card className="card-emerald p-xl rounded-2xl">
      <Typography
        variant="headline-sm"
        as="h2"
        className="mb-lg card-emerald-text font-bold flex items-center"
      >
        <span className="w-8 h-8 bg-[var(--card-emerald-bg-light)] border-2 border-[var(--card-emerald-border)] rounded-lg flex items-center justify-center mr-sm">
          <Activity className="card-emerald-icon w-4 h-4" />
        </span>
        Athletic Information
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Position
          </Typography>
          <Input
            type="text"
            placeholder="e.g., Quarterback, Running Back"
            value={position}
            onChange={(e) => onInputChange("position", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Jersey Number
          </Typography>
          <Input
            type="number"
            placeholder="99"
            value={jerseyNumber}
            onChange={(e) => onInputChange("jersey_number", e.target.value)}
            min={0}
            max={99}
            className={validationErrors.jersey_number ? "border-error-500" : ""}
          />
          <ValidationErrorDisplay error={validationErrors.jersey_number} />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Height (inches)
          </Typography>
          <Input
            type="number"
            placeholder="72"
            value={heightInches}
            onChange={(e) => onInputChange("height_inches", e.target.value)}
            min={48}
            max={84}
            className={validationErrors.height_inches ? "border-error-500" : ""}
          />
          <ValidationErrorDisplay error={validationErrors.height_inches} />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Weight (lbs)
          </Typography>
          <Input
            type="number"
            placeholder="180"
            value={weight}
            onChange={(e) => onInputChange("weight_lbs", e.target.value)}
            min={80}
            max={400}
            className={validationErrors.weight_lbs ? "border-error-500" : ""}
          />
          <ValidationErrorDisplay error={validationErrors.weight_lbs} />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Grade Level
          </Typography>
          <FormSelect
            value={gradeLevel}
            onChange={(value: string) => onInputChange("grade_level", value)}
            placeholder="Select grade level"
            options={[
              { value: "9th", label: "9th Grade" },
              { value: "10th", label: "10th Grade" },
              { value: "11th", label: "11th Grade" },
              { value: "12th", label: "12th Grade" },
              { value: "college", label: "College" },
              { value: "adult", label: "Adult" },
            ]}
          />
        </div>
      </div>
    </Card>
  );
};
