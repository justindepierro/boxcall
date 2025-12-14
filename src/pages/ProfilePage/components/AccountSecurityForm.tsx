import React from "react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Typography } from "../../../components/design-system/Typography";

interface AccountSecurityFormProps {
  onChangePasswordClick: () => void;
}

export const AccountSecurityForm: React.FC<AccountSecurityFormProps> = ({
  onChangePasswordClick,
}) => {
  return (
    <Card className="p-lg shadow-md hover:shadow-lg transition-all duration-300">
      <Typography variant="headline-sm" as="h2" className="mb-md">
        Account Security
      </Typography>
      <div className="space-y-md">
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium text-primary dark:text-border-light mb-xs"
          >
            Password
          </Typography>
          <div className="flex items-center space-x-md">
            <Input
              type="password"
              value="••••••••••"
              disabled
              className="bg-subtle dark:bg-text-primary"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={onChangePasswordClick}
            >
              Change Password
            </Button>
          </div>
          <p className="text-xs text-muted mt-1">
            A password reset link will be sent to your email
          </p>
        </div>
      </div>
    </Card>
  );
};
