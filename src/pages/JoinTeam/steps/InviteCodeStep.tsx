/**
 * InviteCodeStep Component
 *
 * Step for entering a team invite code
 */

import React from "react";
import { Typography } from "../../components/design-system";
import { Icon } from "../../components/ui/Icon/Icon";
import { Button } from "../../components/ui/Button/Button";
import type { InviteCodeStepProps } from "./types";
import { INVITE_CODE_LENGTH } from "./constants";

export const InviteCodeStep: React.FC<InviteCodeStepProps> = ({
  inviteCode,
  isLoading,
  onInviteCodeChange,
  onSubmit,
  onSwitchToSearch,
}) => {
  return (
    <div className="max-w-md mx-auto text-center">
      <Icon name="key" size="xl" color="primary" className="mx-auto mb-6" />
      <Typography variant="headline-lg" className="mb-4">
        Enter Invite Code
      </Typography>
      <Typography variant="body-md" color="muted" className="mb-8">
        Your coach should have provided you with a {INVITE_CODE_LENGTH}-digit
        invite code. Enter it below to join your team.
      </Typography>

      <div className="mb-6">
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => onInviteCodeChange(e.target.value)}
          placeholder="ABC123"
          maxLength={INVITE_CODE_LENGTH}
          className="w-full px-4 py-3 text-center font-mono text-3xl leading-none border border-secondary rounded-lg focus:ring-2 focus:ring-interaction-focus focus:border-interaction-focus tracking-widest"
          aria-label="Invite code"
        />
        <Typography variant="body-sm" color="muted" className="mt-2">
          Enter the {INVITE_CODE_LENGTH}-character code exactly as provided
        </Typography>
      </div>

      <Button
        onClick={onSubmit}
        disabled={inviteCode.length !== INVITE_CODE_LENGTH || isLoading}
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
