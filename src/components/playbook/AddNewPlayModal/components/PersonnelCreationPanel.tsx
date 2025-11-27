/**
 * PersonnelCreationPanel
 *
 * Slide-in panel for quickly creating a new personnel configuration
 * from within the AddNewPlayModal.
 *
 * Simplified version of PersonnelConfigurationModal focused on creation only.
 */

import React, { useState } from "react";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Typography } from "../../../design-system/Typography";
import { useToast } from "../../../../hooks/useToast";
import { PersonnelService } from "../../../../services/personnelService";
import type { PersonnelConfiguration } from "../../../../types/personnel";

interface PersonnelCreationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playbookId: string;
  onCreated: (personnel: PersonnelConfiguration) => void;
}

const COMMON_PERSONNEL = [
  { name: "11 Personnel", description: "1 RB, 1 TE, 3 WR" },
  { name: "12 Personnel", description: "1 RB, 2 TE, 2 WR" },
  { name: "21 Personnel", description: "2 RB, 1 TE, 2 WR" },
  { name: "10 Personnel", description: "1 RB, 0 TE, 4 WR" },
  { name: "22 Personnel", description: "2 RB, 2 TE, 1 WR" },
];

export const PersonnelCreationPanel: React.FC<PersonnelCreationPanelProps> = ({
  isOpen,
  onClose,
  playbookId,
  onCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const toast = useToast();

  const handleQuickCreate = async (
    personnelName: string,
    personnelDesc: string
  ) => {
    setIsCreating(true);

    try {
      const newPersonnel = await PersonnelService.createPersonnelConfiguration({
        playbook_id: playbookId,
        name: personnelName,
        description: personnelDesc,
        players: [], // Empty players for now - can be configured later
      });

      toast.success(`${personnelName} created!`);
      onCreated(newPersonnel);
      handleClose();
    } catch (error) {
      console.error("Failed to create personnel:", error);
      toast.error("Failed to create personnel. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCustomCreate = async () => {
    if (!name.trim()) {
      toast.error("Personnel name is required");
      return;
    }

    await handleQuickCreate(name.trim(), description.trim());
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Panel */}
      <div
        className={`
          fixed inset-y-0 right-0 w-96 max-w-full
          bg-primary shadow-2xl
          transform transition-transform duration-300 ease-in-out
          z-50 overflow-y-auto
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary">
            <div>
              <Typography variant="headline-md" className="text-primary">
                Create Personnel
              </Typography>
              <Typography
                variant="body-sm"
                className="text-secondary mt-1"
              >
                Quick personnel setup for this play
              </Typography>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="ml-4"
            >
              <Icon name="close" className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Quick Create - Common Personnel */}
            <div>
              <Typography
                variant="label-md"
                className="mb-3 text-primary"
              >
                Common Personnel
              </Typography>
              <Typography
                variant="body-sm"
                className="mb-4 text-secondary"
              >
                Choose a standard configuration
              </Typography>
              <div className="space-y-2">
                {COMMON_PERSONNEL.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => handleQuickCreate(p.name, p.description)}
                    disabled={isCreating}
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-secondary hover:border-accent hover:bg-secondary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <Typography
                        variant="body-md"
                        className="text-primary font-medium"
                      >
                        {p.name}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        className="text-secondary"
                      >
                        {p.description}
                      </Typography>
                    </div>
                    <Icon
                      name="chevron-right"
                      className="h-5 w-5 text-tertiary"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary" />
              </div>
              <div className="relative flex justify-center">
                <Typography
                  variant="body-sm"
                  className="px-4 bg-primary text-tertiary"
                >
                  Or create custom
                </Typography>
              </div>
            </div>

            {/* Custom Personnel Form */}
            <div className="space-y-4">
              <div>
                <label className="block mb-2">
                  <Typography variant="label-md" className="text-primary">
                    Personnel Name *
                  </Typography>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Spread, Jumbo, Goal Line"
                  className="w-full px-3 py-3 text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-info focus:border-primary/0 bg-primary text-primary"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block mb-2">
                  <Typography variant="label-md" className="text-primary">
                    Description
                  </Typography>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this personnel package..."
                  rows={3}
                  className="w-full px-3 py-3 text-sm border border-secondary rounded-lg focus:ring-2 focus:ring-info focus:border-primary/0 bg-primary text-primary resize-none"
                  maxLength={200}
                />
              </div>

              <Button
                variant="primary"
                onClick={handleCustomCreate}
                disabled={!name.trim() || isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Icon
                      name="refresh-cw"
                      className="h-4 w-4 mr-2 animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <Icon name="plus" className="h-4 w-4 mr-2" />
                    Create Personnel
                  </>
                )}
              </Button>
            </div>

            {/* Help Text */}
            <div className="p-4 bg-secondary/50 rounded-lg border border-secondary">
              <div className="flex items-start gap-3">
                <Icon
                  name="info"
                  className="h-5 w-5 text-info mt-0.5 flex-shrink-0"
                />
                <div>
                  <Typography
                    variant="label-md"
                    className="text-primary mb-1"
                  >
                    Quick Setup
                  </Typography>
                  <Typography variant="body-sm" className="text-secondary">
                    Create a basic personnel config now. You can add player
                    positions and customize badges later in the Personnel
                    Manager.
                  </Typography>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-secondary">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
