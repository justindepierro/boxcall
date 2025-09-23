import React, { useState, useEffect } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Modal } from "../ui/Modal/Modal";
import type { Play } from "../../types/play";

interface AddNewPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlay?: (playData: Partial<Play>) => void;
  existingPlay?: Play | null;
}

export const AddNewPlayModal: React.FC<AddNewPlayModalProps> = ({
  isOpen,
  onClose,
  onCreatePlay,
  existingPlay,
}) => {
  const [playName, setPlayName] = useState(existingPlay?.play_name || "");
  const [formation, setFormation] = useState(existingPlay?.formation || "");
  const [playType, setPlayType] = useState(existingPlay?.p_type || "");
  const [personnel, setPersonnel] = useState(existingPlay?.personnel || "");
  const [description, setDescription] = useState(existingPlay?.notes || "");

  // Update form when existingPlay changes
  useEffect(() => {
    if (existingPlay) {
      setPlayName(existingPlay.play_name || "");
      setFormation(existingPlay.formation || "");
      setPlayType(existingPlay.p_type || "");
      setPersonnel(existingPlay.personnel || "");
      setDescription(existingPlay.notes || "");
    } else {
      // Reset form for new play
      setPlayName("");
      setFormation("");
      setPlayType("");
      setPersonnel("");
      setDescription("");
    }
  }, [existingPlay]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!playName.trim()) {
      alert("Please enter a play name");
      return;
    }

    setIsSubmitting(true);

    try {
      const playData = {
        play_name: playName.trim(),
        formation: formation.trim() || undefined,
        p_type: playType || undefined,
        personnel: personnel.trim() || undefined,
        description: description.trim() || undefined,
      };

      await onCreatePlay?.(playData);

      // Reset form
      setPlayName("");
      setFormation("");
      setPlayType("");
      setPersonnel("");
      setDescription("");

      onClose();
    } catch (error) {
      console.error("Failed to create play:", error);
      alert("Failed to create play. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formations = [
    "Empty",
    "Shotgun",
    "Pistol",
    "Wildcat",
    "Trips Right",
    "Trips Left",
    "Bunch Right",
    "Bunch Left",
    "Stack Right",
    "Stack Left",
  ];

  const playTypes = [
    "Pass",
    "Run",
    "Screen",
    "Draw",
    "Trick",
    "Field Goal",
    "Punt",
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingPlay ? "Edit Play" : "Create New Play"}
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !playName.trim()}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>{existingPlay ? "Updating..." : "Creating..."}</>
            ) : (
              <>
                <Icon
                  name={existingPlay ? "edit" : "plus"}
                  className="h-4 w-4 mr-2"
                />
                {existingPlay ? "Update Play" : "Create Play"}
              </>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon name="plus" className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <Typography variant="body-lg" className="text-gray-600">
              {existingPlay
                ? "Update play details"
                : "Add a new play to your playbook"}
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Play Name */}
          <div>
            <Typography variant="label-md" className="block mb-2">
              Play Name *
            </Typography>
            <input
              type="text"
              value={playName}
              onChange={(e) => setPlayName(e.target.value)}
              placeholder="e.g., Power Read, Slant Route, Zone Blitz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formation */}
            <div>
              <Typography variant="label-md" className="block mb-2">
                Formation
              </Typography>
              <select
                value={formation}
                onChange={(e) => setFormation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select formation...</option>
                {formations.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Play Type */}
            <div>
              <Typography variant="label-md" className="block mb-2">
                Play Type
              </Typography>
              <select
                value={playType}
                onChange={(e) => setPlayType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type...</option>
                {playTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Personnel */}
          <div>
            <Typography variant="label-md" className="block mb-2">
              Personnel
            </Typography>
            <input
              type="text"
              value={personnel}
              onChange={(e) => setPersonnel(e.target.value)}
              placeholder="e.g., 11 Personnel, 12 Personnel, Nickel"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Typography variant="body-sm" className="text-gray-500 mt-1">
              Personnel grouping (e.g., 11 = 1 RB, 1 TE, 1 WR)
            </Typography>
          </div>

          {/* Description */}
          <div>
            <Typography variant="label-md" className="block mb-2">
              Description
            </Typography>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the play..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};
