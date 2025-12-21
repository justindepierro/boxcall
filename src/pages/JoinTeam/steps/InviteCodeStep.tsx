/**
 * InviteCodeStep Component
 *
 * Step for entering a team invite code
 */

import React from "react";
import { Typography } from "../../../components/design-system";
import Icon from "../../../components/ui/Icon/Icon";
import { Button } from "../../../components/ui/Button/Button";
import type { InviteCodeStepProps } from "../types";
import { INVITE_CODE_LENGTH } from "../constants";

export const InviteCodeStep: React.FC<InviteCodeStepProps> = ({
  inviteCode,
  isLoading,
  onInviteCodeChange,
  onSubmit,
  onSwitchToSearch,
}) => {
  const normalizedLength = inviteCode.trim().length;

  return (
    <div className="max-w-md mx-auto text-center">
      <Icon name="key" size="xl" color="primary" className="mx-auto mb-6" />
      <Typography variant="headline-lg" className="mb-4">
        Enter Invite Code or Link
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-8">
        Paste the invite code or the full invite link from your coach.
      </Typography>

      <div className="mb-6">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => onInviteCodeChange(e.target.value)}
          placeholder="ABC123 or https://.../invite/accept?token=..."
          className="w-full px-4 py-3 text-center font-mono text-3xl leading-none border border-secondary rounded-lg focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus tracking-widest"
          aria-label="Invite code"
        />
        <Typography variant="body-sm" color="muted" className="mt-2">
          Minimum {INVITE_CODE_LENGTH} characters. You can also paste the full
          invite link.
        </Typography>
      </div>

      <Button
        onClick={onSubmit}
        disabled={normalizedLength < INVITE_CODE_LENGTH || isLoading}
        variant="primary"
        size="md"
        className="w-full mb-4"
      >
        {isLoading ? "Verifying..." : "Join Team"}
      </Button>

      <div className="text-center">
        <Typography variant="body-sm" color="muted" className="mb-2">
          Don't have an invite code?
        </Typography>
        <Button
          type="button"
          variant="brandLink"
          size="sm"
          onClick={onSwitchToSearch}
        >
          Search for your team instead
        </Button>
      </div>
    </div>
  );
};

InviteCodeStep.displayName = "InviteCodeStep";
