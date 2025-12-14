import React from "react";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Typography } from "../../../components/design-system/Typography";
import { MultiBadgeDisplay } from "../../../components/ui/MultiBadgeDisplay";
import { User } from "lucide-react";

interface ValidationError {
  phone?: string;
}

interface BasicInfoFormProps {
  email: string;
  displayName: string;
  fullName: string;
  phone: string;
  address: string;
  bio: string;
  isAdmin: boolean;
  appRole: string;
  subscriptionTier: string;
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

export const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  email,
  displayName,
  fullName,
  phone,
  address,
  bio,
  isAdmin,
  appRole,
  subscriptionTier,
  validationErrors,
  onInputChange,
}) => {
  return (
    <Card className="p-xl shadow-md shadow-jade-500/10 hover:shadow-lg hover:shadow-jade-500/20 transition-all duration-300">
      <Typography
        variant="headline-sm"
        as="h2"
        className="mb-lg text-brand-primary font-bold flex items-center"
      >
        <span className="w-8 h-8 bg-gradient-to-br from-jade-50 to-jade-100 border-2 border-jade-200 rounded-lg flex items-center justify-center mr-sm">
          <User className="text-jade-600 w-4 h-4" />
        </span>
        Basic Information
      </Typography>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Email Address
          </Typography>
          <Input type="email" value={email} disabled className="bg-muted" />
          <p className="text-xs text-muted mt-1">Email cannot be changed</p>
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Display Name
          </Typography>
          <Input
            type="text"
            placeholder="How you'd like to be called"
            value={displayName}
            onChange={(e) => onInputChange("display_name", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Full Name
          </Typography>
          <Input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => onInputChange("full_name", e.target.value)}
          />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Phone Number
          </Typography>
          <Input
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            className={validationErrors.phone ? "border-error-500" : ""}
          />
          <ValidationErrorDisplay error={validationErrors.phone} />
        </div>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary mb-xs"
          >
            Role & Subscription
          </Typography>
          <MultiBadgeDisplay
            isAdmin={isAdmin}
            appRole={appRole}
            subscriptionTier={subscriptionTier}
            size="md"
            layout="wrap"
          />
          <p className="text-xs text-muted mt-xs">
            Role is set by team administrators
          </p>
        </div>
        <div className="md:col-span-2">
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary dark:text-border-light mb-xs"
          >
            Address
          </Typography>
          <Input
            type="text"
            placeholder="Your address"
            value={address}
            onChange={(e) => onInputChange("address", e.target.value)}
          />
        </div>
      </div>
      <div className="mt-lg">
        <Typography
          variant="body-sm"
          as="label"
          className="block font-medium text-primary dark:text-border-light mb-xs"
        >
          Bio
        </Typography>
        <textarea
          rows={4}
          placeholder="Tell us about yourself..."
          value={bio}
          onChange={(e) => onInputChange("bio", e.target.value)}
          className="w-full px-sm py-xs border border-secondary dark:border-text-tertiary rounded-lg shadow-sm focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus dark:bg-text-primary dark:text-inverse font-sans"
        />
      </div>
    </Card>
  );
};
