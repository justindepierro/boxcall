import React, { useState, useMemo } from "react";
import { Icon } from "../ui/Icon/Icon";
import { Button } from "../ui/Button/Button";
import { Typography } from "../design-system/Typography";
import { Tooltip } from "../ui/Tooltip/Tooltip";

export interface BulkTaggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  playIds: string[];
  existingTagFetcher?: (playIds: string[]) => Promise<string[]>; // future enhancement
  onApply: (tags: string[]) => Promise<void> | void;
}

// Simple in-memory tag suggestion list (future: fetch distinct tags from service)
const SUGGESTED_TAGS = [
  "Shot",
  "Screen",
  "Blitz",
  "3rdDown",
  "RedZone",
  "Tempo",
  "Trick",
];

export const BulkTaggingModal: React.FC<BulkTaggingModalProps> = ({
  isOpen,
  onClose,
  playIds,
  existingTagFetcher: _existingTagFetcher,
  onApply,
}) => {
  const [input, setInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<{
    added: number;
    skipped: number;
  } | null>(null);

  const normalized = (t: string) => t.trim().replace(/\s+/g, "-");

  const suggestions = useMemo(() => {
    const q = input.toLowerCase();
    return SUGGESTED_TAGS.filter(
      (t) => t.toLowerCase().includes(q) && !selectedTags.includes(t)
    ).slice(0, 6);
  }, [input, selectedTags]);

  if (!isOpen) return null;

  const handleAddTag = (raw: string) => {
    const tag = normalized(raw);
    if (!tag || selectedTags.includes(tag)) return;
    setSelectedTags((t) => [...t, tag]);
    setInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags((t) => t.filter((x) => x !== tag));
  };

  const handleSubmit = async () => {
    if (selectedTags.length === 0) return;
    setLoading(true);
    try {
      await onApply(selectedTags);
      // Placeholder: assume all added (future: diff existing tags per play)
      setApplied({ added: selectedTags.length, skipped: 0 });
      setSelectedTags([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bulk Tagging"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-text-xssrimary/40" onClick={onClose} />
      <div className="relative surface-card elevation-modal rounded-lg shadow-lg w-full max-w-lg mx-4 p-6 animate-fade-in">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Typography
              variant="headline-sm"
              as="h3"
              className="text-text-xssrimary"
            >
              Add Tags to {playIds.length} Play{playIds.length === 1 ? "" : "s"}
            </Typography>
            <p className="text-xsss text-text-secondary mt-1">
              Tags will be appended. Duplicates are ignored automatically
              (future enhancement).
            </p>
          </div>
          <Tooltip content="Close tag modal (Esc)">
            <Button
              variant="ghost"
              size="xs"
              onClick={onClose}
              aria-label="Close"
              icon={<Icon name="close" className="w-4 h-4" />}
              iconPosition="only"
            />
          </Tooltip>
        </div>
        <div>
          <label className="block text-xsss font-medium text-text-secondary mb-1">
            New Tag
          </label>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(input);
                }
              }}
              className="flex-1 border-subtle rounded-lg px-2 py-1 text-sm"
              placeholder="Type tag and press Enter"
            />
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleAddTag(input)}
              disabled={!input.trim()}
              icon={<Icon name="plus" className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  size="xs"
                  variant="subtle"
                  className="!h-auto px-2 py-0.5 text-xs"
                  onClick={() => handleAddTag(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          )}
        </div>
        {selectedTags.length > 0 && (
          <div className="mt-4">
            <div className="text-xsss font-medium text-text-secondary mb-1">
              Pending Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((t) => (
                <Button
                  key={t}
                  size="xs"
                  variant="subtle"
                  className="!h-auto px-2 py-0.5 text-xs"
                  onClick={() => handleRemoveTag(t)}
                  title="Remove tag"
                >
                  {t} ×
                </Button>
              ))}
            </div>
          </div>
        )}
        {applied && (
          <div className="mt-4 text-xsss text-text-success">
            Added {applied.added} tag{applied.added === 1 ? "" : "s"}.
            {applied.skipped > 0 && ` ${applied.skipped} duplicates skipped.`}
          </div>
        )}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-xsss text-text-secondary flex items-center gap-1">
            <Icon name="tag" className="w-3 h-3" />
            {selectedTags.length === 0
              ? "No tags added yet"
              : `${selectedTags.length} tag${selectedTags.length === 1 ? "" : "s"} ready`}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={selectedTags.length === 0 || loading}
            >
              {loading ? "Applying..." : "Apply Tags"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkTaggingModal;
