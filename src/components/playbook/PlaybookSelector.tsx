/**
 * PlaybookSelector - Dropdown for switching between playbooks
 *
 * Features:
 * - Select active playbook from team's playbooks
 * - Rename playbook inline
 * - Create new playbook
 * - Visual indicator for active playbook
 */

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Edit2, Plus, Check, X } from "lucide-react";
import { createPortal } from "react-dom";
import { Typography } from "../design-system/Typography";
import { Button } from "../ui/Button/Button";
import { supabase } from "../../lib/supabase";

interface Playbook {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  play_count: number;
  created_at: string;
  updated_at: string;
}

interface PlaybookSelectorProps {
  playbooks: Playbook[];
  activePlaybookId: string;
  onPlaybookChange: (playbookId: string) => void;
  onPlaybookUpdated?: () => void;
  teamId: string;
}

export const PlaybookSelector: React.FC<PlaybookSelectorProps> = ({
  playbooks,
  activePlaybookId,
  onPlaybookChange,
  onPlaybookUpdated,
  teamId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const activePlaybook = playbooks.find((pb) => pb.id === activePlaybookId);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 320),
      });
    }
  }, [isOpen]);

  const handleStartEdit = (playbook: Playbook, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(playbook.id);
    setEditingName(playbook.name);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingId || !editingName.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("playbooks")
        .update({
          name: editingName.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) throw error;

      setEditingId(null);
      if (onPlaybookUpdated) {
        onPlaybookUpdated();
      }
    } catch (error) {
      console.error("Failed to update playbook name:", error);
      alert("Failed to update playbook name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName("");
  };

  const handleCreateNew = async () => {
    const name = prompt("Enter new playbook name:");
    if (!name || !name.trim()) return;

    try {
      const { data, error } = await supabase
        .from("playbooks")
        .insert({
          team_id: teamId,
          name: name.trim(),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      if (onPlaybookUpdated) {
        onPlaybookUpdated();
      }

      // Switch to the new playbook
      if (data) {
        onPlaybookChange((data as any).id);
      }
    } catch (error) {
      console.error("Failed to create playbook:", error);
      alert("Failed to create playbook. Please try again.");
    }
  };

  if (playbooks.length === 0) {
    return (
      <div className="flex items-center gap-spacing-sm p-spacing-sm bg-surface-muted rounded-lg border border-secondary">
        <Typography variant="body-sm" className="text-muted">
          No playbooks found
        </Typography>
        <Button
          onClick={handleCreateNew}
          variant="secondary"
          size="sm"
          className="gap-spacing-xs"
        >
          <Plus className="w-4 h-4" />
          Create Playbook
        </Button>
      </div>
    );
  }

  return (
    <div className="relative z-50">
      {/* Selected Playbook Display - Compact for header */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-spacing-xs px-3 py-2 bg-surface-primary hover:bg-surface-secondary border-2 border-emerald-500 rounded-xl transition-colors w-45 h-11 shadow-md"
      >
        <div className="flex-1 text-left">
          <Typography variant="caption" className="text-muted text-xs">
            Playbook
          </Typography>
          <Typography
            variant="body-sm"
            className="text-primary font-semibold leading-tight"
          >
            {activePlaybook?.name || "Select..."}
          </Typography>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu - Using Portal */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[100]"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            />

            {/* Menu - Positioned at button location */}
            <div
              className="fixed bg-surface-primary rounded-lg shadow-2xl z-[110] max-h-96 overflow-y-auto"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Playbook List */}
              <div className="p-spacing-xs">
                {playbooks.map((playbook) => (
                  <div
                    key={playbook.id}
                    className={`flex items-center gap-spacing-sm p-spacing-sm rounded hover:bg-surface-muted transition-colors ${
                      playbook.id === activePlaybookId ? "bg-primary-50" : ""
                    }`}
                  >
                    {editingId === playbook.id ? (
                      // Edit Mode
                      <div
                        className="flex-1 flex items-center gap-spacing-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-spacing-sm py-spacing-xs border border-primary rounded text-primary bg-surface-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveEdit(e as any);
                            } else if (e.key === "Escape") {
                              handleCancelEdit(e as any);
                            }
                          }}
                          disabled={saving}
                        />
                        <button
                          onClick={handleSaveEdit}
                          disabled={saving}
                          className="p-spacing-xs text-success-600 hover:bg-success-100 rounded transition-colors"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={saving}
                          className="p-spacing-xs text-muted hover:bg-surface-muted rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // Display Mode
                      <>
                        <button
                          onClick={() => {
                            onPlaybookChange(playbook.id);
                            setIsOpen(false);
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-spacing-sm">
                            <div className="flex-1">
                              <Typography
                                variant="body-md"
                                className={`font-medium ${
                                  playbook.id === activePlaybookId
                                    ? "text-primary-600"
                                    : "text-primary"
                                }`}
                              >
                                {playbook.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                className="text-secondary"
                              >
                                {playbook.play_count || 0} play
                                {playbook.play_count !== 1 ? "s" : ""}
                              </Typography>
                            </div>
                            {playbook.id === activePlaybookId && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full" />
                            )}
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleStartEdit(playbook, e)}
                          className="p-spacing-xs text-muted hover:text-primary hover:bg-surface-muted rounded transition-colors"
                          title="Rename playbook"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Create New Playbook */}
              <div className="border-t border-secondary p-spacing-xs">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleCreateNew();
                  }}
                  className="w-full flex items-center gap-spacing-sm p-spacing-sm rounded hover:bg-surface-muted transition-colors text-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  <Typography variant="body-md" className="font-medium">
                    Create New Playbook
                  </Typography>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
