import React, { useState } from "react";
import { X } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system/Typography";
import type { Play as PlayType } from "../../types/play";
import { getDisplayName } from "../../utils/playNameUtils";
import { AnnouncementsService } from "../../services/announcementsService";
import { toast } from "sonner";

interface PostToTeamBulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  play: PlayType;
  teamId: string;
  onSuccess?: () => void;
}

export const PostToTeamBulletinModal: React.FC<
  PostToTeamBulletinModalProps
> = ({ isOpen, onClose, play, teamId, onSuccess }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const playDisplayName = getDisplayName(play, false, undefined, undefined, "full");
  const playUrl = `/playbook/${play.playbook_id}?play=${play.id}`;

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please add a message");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Create announcement with embedded link
      const contentJson = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: message,
              },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                marks: [
                  {
                    type: "link",
                    attrs: {
                      href: playUrl,
                      target: "_self",
                      class: "play-link",
                    },
                  },
                ],
                text: `📋 View Play: ${playDisplayName}`,
              },
            ],
          },
        ],
      };

      const result = await AnnouncementsService.createAnnouncement({
        team_id: teamId,
        title: `New Play: ${playDisplayName}`,
        content: `${message}\n\nView Play: ${playDisplayName}`,
        content_json: JSON.stringify(contentJson),
        visibility: "all",
        status: "published",
      });

      console.log("Create announcement result:", result);

      if (result.success) {
        toast.success("Successfully posted to team bulletin!");
        onSuccess?.();
        onClose();
        setMessage("");
      } else {
        console.error("Failed to create announcement:", result.error);
        toast.error(result.error || "Failed to post announcement");
        setError(result.error || "Failed to post announcement");
      }
    } catch (err) {
      console.error("Error posting to team bulletin:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to post announcement";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="bg-surface-primary rounded-xl shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Icon name="message" className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <Typography variant="headline-sm" className="font-semibold">
                Post to Team Bulletin
              </Typography>
              <Typography variant="body-sm" color="muted">
                Share this play with your team
              </Typography>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-secondary hover:text-primary transition-colors p-2 -mr-2"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Play Preview */}
          <div className="bg-surface-subtle rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="file" className="w-6 h-6 text-brand-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <Typography variant="body-md" className="font-medium truncate">
                  {playDisplayName}
                </Typography>
                <Typography variant="body-sm" color="muted">
                  {play.p_type || "Play"}
                  {play.personnel && ` • ${play.personnel}`}
                </Typography>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label htmlFor="message" className="block mb-2">
              <Typography variant="body-sm" className="font-medium">
                Message
              </Typography>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message about this play... (e.g., 'Check out this new play we're installing this week!')"
              className="w-full px-4 py-3 bg-surface-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none transition-colors"
              rows={4}
              disabled={isSubmitting}
            />
            <Typography variant="body-xs" color="muted" className="mt-1">
              A link to the play will be automatically added
            </Typography>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-error-bg border border-error-border rounded-lg p-3">
              <Typography variant="body-sm" className="text-error-600">
                {error}
              </Typography>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-surface-subtle/50">
          <Button
            variant="ghost"
            size="md"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Icon name="loader" className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Icon name="message" className="w-4 h-4" />
                Post to Bulletin
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
