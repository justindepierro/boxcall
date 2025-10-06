import React, { useState } from "react";
import { Typography } from "../../../components/design-system/Typography";
import { Button } from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import { Modal } from "../../../components/ui/Modal/Modal";
import type { CreatePracticeBlockData } from "../../../types/practice";

interface CreateBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePracticeBlockData) => Promise<void>;
}

export function CreateBlockModal({
  isOpen,
  onClose,
  onSave,
}: CreateBlockModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      title,
      description,
      duration,
    });
    // Reset form
    setTitle("");
    setDescription("");
    setDuration(15);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <Typography variant="headline-md" className="text-text-primary mb-6">
          Create Custom Practice Block
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Block Title
            </Typography>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Offensive Line Drills"
              required
            />
          </div>
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Description
            </Typography>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the practice block..."
              className="w-full p-3 border border-subtle rounded-lg focus:ring-jade-500 focus:border-jade-500"
              rows={3}
            />
          </div>
          <div>
            <Typography
              variant="body-sm"
              as="label"
              className="block font-medium text-text-secondary mb-2"
            >
              Duration (minutes)
            </Typography>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={1}
              max={120}
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Block
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
