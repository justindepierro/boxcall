/**
 * SendInvitationModal Component
 *
 * Modal for sending player invitations with email input
 * - Pre-fills email if player already has one
 * - Validates email format
 * - Shows loading state during send
 */

import { useState, useEffect } from "react";
import { Modal, Button, Input } from "../ui";
import { Typography } from "../design-system";
import type { RosterPlayerView } from "../../services/rosterService";

export interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: RosterPlayerView | null;
  onSend: (email: string) => Promise<void>;
  defaultEmail?: string;
}

export function SendInvitationModal({
  isOpen,
  onClose,
  player,
  onSend,
  defaultEmail = "",
}: SendInvitationModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when modal opens/closes or player changes
  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setError("");
    }
  }, [isOpen, defaultEmail]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSend = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSend(email);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send invitation"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!player) return null;

  const isResend = player.invitation_status === "pending";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isResend ? "Resend" : "Send"} Invitation`}
    >
      <div className="space-y-md">
        <div>
          <Typography variant="body-md" className="text-secondary mb-sm">
            Sending invitation to:
          </Typography>
          <Typography variant="headline-sm" className="font-semibold">
            {player.first_name} {player.last_name}
          </Typography>
          {player.nickname && (
            <Typography variant="body-sm" className="text-secondary italic">
              "{player.nickname}"
            </Typography>
          )}
        </div>

        <div>
          <label
            htmlFor="invitation-email"
            className="block text-sm font-medium mb-xs"
          >
            Email Address
          </label>
          <Input
            id="invitation-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="player@example.com"
            disabled={isLoading}
            className={error ? "border-error" : ""}
          />
          {error && (
            <Typography variant="body-sm" className="text-error mt-xs">
              {error}
            </Typography>
          )}
        </div>

        {isResend && (
          <div className="bg-warning-bg border border-warning rounded-md p-sm">
            <Typography variant="body-sm" className="text-warning-600">
              This player was previously invited. They will receive a reminder
              email.
            </Typography>
          </div>
        )}

        <div className="flex gap-sm justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSend} disabled={isLoading}>
            {isLoading
              ? "Sending..."
              : isResend
                ? "Resend Invitation"
                : "Send Invitation"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
