/**
 * PaymentStep - Payment information for coach account
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import { Icon } from "../../../components/ui/Icon/Icon";
import type { PaymentStepProps } from "../types";

export const PaymentStep: React.FC<PaymentStepProps> = ({ isSuperAdmin }) => {
  return (
    <div>
      <Typography variant="headline-lg" className="mb-2">
        Complete Your Purchase
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-6">
        One-time payment for lifetime coach account access.
      </Typography>

      {/* Payment System Coming Soon Notice */}
      <div className="bg-subtle dark:bg-warning/20 border border-muted dark:border-text-warning rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <Icon name="warning" size="sm" color="warning" className="mt-0.5" />
          <div>
            <Typography
              variant="body-sm"
              className="font-medium text-warning dark:text-warning mb-1"
            >
              Payment System Coming Soon
            </Typography>
            <Typography variant="body-sm" color="muted">
              We're still setting up our payment processing. For now, all coach
              accounts get full access during our beta period.
            </Typography>
          </div>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="bg-accent dark:bg-accent-dark border border-surface-jade-dark dark:border-brand-jade-dark rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-brand-jade-dark dark:text-brand-jade-light">
            <Icon name="unlock" size="sm" />
            <Typography variant="body-sm" className="font-medium">
              Super Admin: Payment skipped - coach account access granted
            </Typography>
          </div>
        </div>
      )}

      {/* Coach Account Package */}
      <div className="border-2 border-component-badge-primary rounded-lg p-6 bg-subtle dark:bg-info/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Typography variant="headline-lg" className="mb-2">
              Coach Account
            </Typography>
            <Typography variant="body-md" color="muted">
              Personal coaching toolkit and playbook system
            </Typography>
          </div>
          <Typography variant="headline-xl" className="text-info">
            $9.99
          </Typography>
        </div>

        <div className="border-t pt-4">
          <Typography variant="body-sm" className="font-medium mb-2">
            What you get:
          </Typography>
          <ul className="grid-form gap-2 text-sm">
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Personal playbook library
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Practice planning tools
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Game planning features
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Analytics dashboard
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Team integration ready
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size="xs" color="success" />
              Lifetime access
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
