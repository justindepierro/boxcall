import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import Textarea from "../ui/TextArea/TextArea";
import { Badge } from "../ui/Badge";
import { PracticeService } from "@services";
import type { PracticeTemplate } from "../../types/practice";
import { useToast } from "../../hooks/useToast";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";
import { logError } from "../../utils/logger";
import { ConfirmationModal } from "../ui/ConfirmationModal/ConfirmationModal";

interface TemplateCardProps {
  template: PracticeTemplate;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onDelete,
}) => (
  <div
    onClick={onSelect}
    className={(() => {
      const base = "p-4 border-2 rounded-lg cursor-pointer transition-all ";
      if (isSelected) return `${base}border-primary bg-primary-light`;
      return `${base}border-border hover:border-primary-light`;
    })()}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Typography variant="body-md" className="font-medium">
            {template.name}
          </Typography>
          {template.isPublic && (
            <Badge variant="info" size="sm">
              Public
            </Badge>
          )}
        </div>
        {template.description && (
          <Typography variant="body-sm" className="text-secondary">
            {template.description}
          </Typography>
        )}
        {template.duration && (
          <Typography variant="caption" className="text-muted mt-1">
            Duration: {template.duration} minutes
          </Typography>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(template.id);
        }}
        className="text-error hover:text-error"
      >
        <Icon name="delete" className="h-4 w-4" />
      </Button>
    </div>
  </div>
);

interface SaveTemplateFormProps {
  templateName: string;
  templateDescription: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

const SaveTemplateForm: React.FC<SaveTemplateFormProps> = ({
  templateName,
  templateDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onCancel,
}) => (
  <>
    <div>
      <Typography variant="body-sm" className="text-secondary mb-4">
        Create a reusable template from this practice script. Templates help you
        quickly set up similar practices (e.g., "Tuesday Install", "Friday
        Walkthrough").
      </Typography>
    </div>

    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Template Name *
      </label>
      <Input
        value={templateName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onNameChange(e.target.value)
        }
        placeholder="e.g., Tuesday Install, Friday Walkthrough"
        className="w-full"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        Description (Optional)
      </label>
      <Textarea
        value={templateDescription}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onDescriptionChange(e.target.value)
        }
        placeholder="Describe when to use this template..."
        rows={3}
        className="w-full"
      />
    </div>

    <div className="flex justify-end space-x-2 pt-4 border-t border-border">
      <Button variant="ghost" onClick={onCancel}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={onSave}
        disabled={!templateName.trim()}
      >
        <Icon name="save" className="h-4 w-4 mr-2" />
        Create Template
      </Button>
    </div>
  </>
);

interface TemplateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "save" | "load";
  teamId: string;
  onSaveTemplate?: (name: string, description?: string) => void;
  onLoadTemplate?: (templateId: string, scriptName: string) => void;
}

export const TemplateManagementModal: React.FC<
  TemplateManagementModalProps
> = ({ isOpen, onClose, mode, teamId, onSaveTemplate, onLoadTemplate }) => {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [scriptName, setScriptName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const toast = useToast();

  // Load templates when modal opens in load mode
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const loadedTemplates = await PracticeService.getTemplates(teamId);
      setTemplates(loadedTemplates);
    } catch (error) {
      logError("Failed to load templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    if (isOpen && mode === "load") {
      loadTemplates();
    }
  }, [isOpen, mode, loadTemplates]);

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    triggerHapticFeedback("medium");
    onSaveTemplate?.(templateName, templateDescription);
    setTemplateName("");
    setTemplateDescription("");
  };

  const handleLoad = () => {
    if (!selectedTemplateId) {
      toast.error("Please select a template");
      return;
    }
    if (!scriptName.trim()) {
      toast.error("Please enter a script name");
      return;
    }
    triggerHapticFeedback("medium");
    onLoadTemplate?.(selectedTemplateId, scriptName);
    setSelectedTemplateId("");
    setScriptName("");
  };

  const handleDelete = async (templateId: string) => {
    setDeleteTemplateId(templateId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTemplateId) return;

    try {
      await PracticeService.deleteTemplate(deleteTemplateId);
      toast.success("Template deleted");
      loadTemplates(); // Refresh list
    } catch (error) {
      logError("Failed to delete template:", error);
      toast.error("Failed to delete template");
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTemplateId(null);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        headerContent={
          <Typography variant="headline-sm" className="text-primary">
            {mode === "save" ? "Save as Template" : "Load from Template"}
          </Typography>
        }
      >
        <div className="space-y-6">
          {mode === "save" ? (
            <SaveTemplateForm
              templateName={templateName}
              templateDescription={templateDescription}
              onNameChange={setTemplateName}
              onDescriptionChange={setTemplateDescription}
              onSave={handleSave}
              onCancel={onClose}
            />
          ) : (
            // Load Template Mode
            <>
              <div>
                <Typography variant="body-sm" className="text-secondary mb-4">
                  Select a template to create a new practice script.
                </Typography>
              </div>

              {(() => {
                if (loading) {
                  return (
                    <div className="text-center py-8">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                      <Typography variant="body-sm" className="text-muted">
                        Loading templates...
                      </Typography>
                    </div>
                  );
                }
                if (templates.length === 0) {
                  return (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                      <Icon
                        name="file"
                        className="h-16 w-16 text-muted mx-auto mb-4"
                      />
                      <Typography
                        variant="headline-sm"
                        className="text-secondary mb-2"
                      >
                        No templates yet
                      </Typography>
                      <Typography variant="body-sm" className="text-muted">
                        Create your first template by saving a practice script.
                      </Typography>
                    </div>
                  );
                }
                return (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplateId === template.id}
                          onSelect={() => setSelectedTemplateId(template.id)}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>

                    {selectedTemplateId && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-primary mb-2">
                          New Script Name *
                        </label>
                        <Input
                          value={scriptName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setScriptName(e.target.value)
                          }
                          placeholder="e.g., Week 3 - Tuesday Install"
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                      <Button variant="ghost" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleLoad}
                        disabled={!selectedTemplateId || !scriptName.trim()}
                      >
                        <Icon name="folder" className="h-4 w-4 mr-2" />
                        Load Template
                      </Button>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteTemplateId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Template"
        message="Delete this template? This cannot be undone."
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};
