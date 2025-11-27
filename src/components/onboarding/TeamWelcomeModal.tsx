import React from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";

interface TeamWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamName: string;
  onGoToBulletin: () => void;
  onStartTour?: () => void;
}

/**
 * Welcome modal shown after successful team creation
 * Celebrates the achievement and guides users to next steps
 */
export const TeamWelcomeModal: React.FC<TeamWelcomeModalProps> = ({
  isOpen,
  onClose,
  teamName,
  onGoToBulletin,
  onStartTour,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className="text-center py-6">
        {/* Celebration Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-success-50 rounded-full flex items-center justify-center mb-4">
            <Icon name="check-circle" size="xl" color="success" />
          </div>
          <div className="flex justify-center gap-2 text-2xl">🎉 🏈 🎉</div>
        </div>

        {/* Welcome Message */}
        <Typography variant="headline-lg" className="mb-3">
          Welcome to {teamName}!
        </Typography>
        <Typography
          variant="body-lg"
          color="muted"
          className="mb-8 content-narrow"
        >
          Your team has been successfully created and you're ready to start
          building something amazing together.
        </Typography>

        {/* Feature Highlights */}
        <div className="bg-subtle rounded-lg p-6 mb-8 text-left">
          <Typography variant="headline-sm" className="mb-4 text-center">
            What you can do now:
          </Typography>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Icon name="users" size="sm" color="primary" className="mt-0.5" />
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Invite team members
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Add players, coaches, and staff to your team
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon name="book" size="sm" color="primary" className="mt-0.5" />
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Build your playbook
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Create and organize plays for your team
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon
                name="calendar"
                size="sm"
                color="primary"
                className="mt-0.5"
              />
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Schedule events
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Plan practices, games, and team activities
                </Typography>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Icon
                name="message"
                size="sm"
                color="primary"
                className="mt-0.5"
              />
              <div>
                <Typography variant="body-sm" className="font-medium">
                  Team communication
                </Typography>
                <Typography variant="body-xs" color="muted">
                  Share updates and stay connected with your team
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onGoToBulletin}
            variant="primary"
            size="lg"
            className="w-full"
            icon={<Icon name="arrow-right" size="sm" />}
            iconPosition="right"
          >
            Go to Team Bulletin
          </Button>
          {onStartTour && (
            <Button
              onClick={onStartTour}
              variant="outline"
              size="md"
              className="w-full"
              icon={<Icon name="play" size="sm" />}
            >
              Take a Quick Tour
            </Button>
          )}
        </div>

        {/* Skip Option */}
        <Typography variant="body-xs" color="muted" className="mt-4">
          You can always access these features from your team bulletin
        </Typography>
      </div>
    </Modal>
  );
};
