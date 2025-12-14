import React from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Typography } from "../../../components/design-system/Typography";
import { AlertTriangle } from "lucide-react";

interface ValidationError {
  emergency_contact?: string;
  emergency_phone?: string;
}

interface EmergencyContactFormProps {
  emergencyContactName: string;
  emergencyPhone: string;
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

export const EmergencyContactForm: React.FC<EmergencyContactFormProps> = ({
  emergencyContactName,
  emergencyPhone,
  validationErrors,
  onInputChange,
}) => {
  return (
    <Card className="p-xl shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 border-2 border-error-200 dark:border-error-700">
      <Typography
        variant="headline-sm"
        as="h2"
        className="mb-lg text-error font-bold flex items-center"
      >
        <span className="w-8 h-8 bg-gradient-to-br from-red-50 to-red-100 border-2 border-error-200 rounded-lg flex items-center justify-center mr-sm">
          <AlertTriangle className="text-error-600 w-4 h-4" />
        </span>
        Emergency Contact
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Emergency Contact Name
          </Typography>
          <Input
            type="text"
            placeholder="Full name of emergency contact"
            value={emergencyContactName}
            onChange={(e) => onInputChange("emergency_contact", e.target.value)}
            className={
              validationErrors.emergency_contact ? "border-error-500" : ""
            }
          />
          <ValidationErrorDisplay error={validationErrors.emergency_contact} />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Emergency Contact Phone
          </Typography>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={emergencyPhone}
            onChange={(e) => onInputChange("emergency_phone", e.target.value)}
            className={
              validationErrors.emergency_phone ? "border-error-500" : ""
            }
          />
          <ValidationErrorDisplay error={validationErrors.emergency_phone} />
        </div>
      </div>
    </Card>
  );
};
