/**
 * CreatePostModal - Modal for creating new posts
 */
import React from "react";
import { Typography } from "../../../design-system/Typography";
import { Button } from "../../../ui/Button/Button";
import { Modal } from "../../../ui/Modal/Modal";
import { TextArea } from "../../../ui/TextArea";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
  labelId?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  content,
  onContentChange,
  onSubmit,
  isCreating,
  labelId = "post-content",
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Post">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <Typography
            variant="body-sm"
            as="label"
            className="block font-medium mb-1"
            htmlFor={labelId}
          >
            Announcement
          </Typography>
          <TextArea
            id={labelId}
            value={content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onContentChange(e.target.value)
            }
            placeholder="Practice moved to 6:30 PM – arrive early for warmups."
            required
            rows={5}
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isCreating}>
            {isCreating ? "Posting..." : "Publish"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * QuickPostComposer - Inline composer for creating posts
 */
interface QuickPostComposerProps {
  content: string;
  onContentChange: (content: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isCreating: boolean;
}

export const QuickPostComposer: React.FC<QuickPostComposerProps> = ({
  content,
  onContentChange,
  onSubmit,
  isCreating,
}) => {
  return (
    <div
      className="border-muted bg-primary elevation-card rounded-lg p-4"
      aria-label="Quick post composer"
    >
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <TextArea
          id="inline-composer"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onContentChange(e.target.value)
          }
          placeholder="Share an update..."
          rows={3}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={isCreating || !content.trim()}
          >
            {isCreating ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
};
