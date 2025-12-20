/**
 * TeamFeedStates - Loading, error, and empty states for team feed
 */
import React from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { OnboardingHint } from "../../../onboarding/OnboardingHint";
import { CreatePostModal } from "./PostComposers";
import { debug } from "../../../../utils/logger";

interface EmptyFeedProps {
  canCreate: boolean;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export const EmptyFeed: React.FC<EmptyFeedProps> = ({
  canCreate,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  content,
  onContentChange,
  onSubmit,
  isCreating,
  triggerRef,
}) => {
  return (
    <div className="space-y-4">
      {canCreate && (
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenModal}
          ref={triggerRef}
        >
          <Icon name="plus" size="sm" /> New Post
        </Button>
      )}
      <OnboardingHint
        icon="message"
        title="Team Feed"
        message="Announcements, practice scripts, and achievements will appear here once you begin posting."
        steps={[
          "Click New Post (coach roles)",
          "Share schedule or practice focus",
          "Attach scripts or files (roadmap)",
        ]}
        actions={
          canCreate
            ? [
                {
                  label: "Plan First Post",
                  variant: "primary",
                  onClick: onOpenModal,
                },
              ]
            : [
                {
                  label: "View Roadmap",
                  variant: "ghost",
                  onClick: () =>
                    debug("[TeamFeedStates] Onboarding roadmap click"),
                },
              ]
        }
      />
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        content={content}
        onContentChange={onContentChange}
        onSubmit={onSubmit}
        isCreating={isCreating}
      />
    </div>
  );
};

export const LoadingFeed: React.FC = () => {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="animate-pulse rounded-lg border-muted bg-primary p-3"
        >
          <div className="h-4 bg-subtle dark:bg-text-tertiary rounded-lg w-5/6 mb-2" />
          <div className="h-4 bg-subtle dark:bg-text-tertiary rounded-lg w-2/3" />
        </li>
      ))}
    </ul>
  );
};

interface ErrorFeedProps {
  error: Error;
  onRetry?: () => void;
}

export const ErrorFeed: React.FC<ErrorFeedProps> = ({ error, onRetry }) => {
  return (
    <div className="rounded border border-text-error bg-subtle bg-surface-error p-4 text-sm text-error">
      Failed to load posts.
      {onRetry && (
        <Button
          type="button"
          variant="link"
          size="xs"
          className="ml-1"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
      {error.message && (
        <div className="mt-1 text-xs opacity-75">{error.message}</div>
      )}
    </div>
  );
};
