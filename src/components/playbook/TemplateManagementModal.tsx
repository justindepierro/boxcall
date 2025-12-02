import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button/Button";
import { Icon } from "../ui/Icon";
import { Typography } from "../design-system/Typography";
import Input from "../ui/Input/Input";
import Textarea from "../ui/TextArea/TextArea";
import { Badge } from "../ui/Badge";
import { PracticeService, type PracticeTemplate } from "@services";
import { useToast } from "../../hooks/useToast";
import { triggerHapticFeedback } from "../../lib/hapticFeedback";

interface TemplateManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "save" | "load";
  teamId: string;
  onSaveTemplate?: (name: string, description?: string) => void;
  onLoadTemplate?: (templateId: string, scriptName: string) => void;
}

export const TemplateManagementModal: React.FC<TemplateManagementModalProps> = ({
  isOpen,
  onClose,
  mode,
  teamId,
  onSaveTemplate,
  onLoadTemplate,
}) => {
  const [templates, setTemplates] = useState<PracticeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [scriptName, setScriptName] = useState("");
  const toast = useToast();

  // Load templates when modal opens in load mode
  useEffect(() => {
    if (isOpen && mode === "load") {
      loadTemplates();
    }
  }, [isOpen, mode]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const loadedTemplates = await PracticeService.getTemplates(teamId);
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error("Failed to load templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

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
    if (!confirm("Delete this template? This cannot be undone.")) return;

    try {
      await PracticeService.deleteTemplate(templateId);
      toast.success("Template deleted");
      loadTemplates(); // Refresh list
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template");
    }
  };

  return (
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
          // Save Template Mode
          <>
            <div>
              <Typography variant="body-sm" className="text-secondary mb-4">
                Create a reusable template from this practice script. Templates help you quickly set up similar practices (e.g., "Tuesday Install", "Friday Walkthrough").
              </Typography>
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Template Name *
              </label>
              <Input
                value={templateName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTemplateName(e.target.value)
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
                  setTemplateDescription(e.target.value)
                }
                placeholder="Describe when to use this template..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-border">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!templateName.trim()}
              >
                <Icon name="bookmark" className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>
          </>
        ) : (
          // Load Template Mode
          <>
            <div>
              <Typography variant="body-sm" className="text-secondary mb-4">
                Select a template to create a new practice script.
              </Typography>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <Typography variant="body-sm" className="text-muted">
                  Loading templates...
                </Typography>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
                <Icon name="file" className="h-16 w-16 text-muted mx-auto mb-4" />
                <Typography variant="headline-sm" className="text-secondary mb-2">
                  No templates yet
                </Typography>
                <Typography variant="body-sm" className="text-muted">
                  Create your first template by saving a practice script.
                </Typography>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`
                        p-4 border-2 rounded-lg cursor-pointer transition-all
                        ${selectedTemplateId === template.id ? "border-primary bg-primary-light" : "border-border hover:border-primary-light"}
                      `}
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
                            handleDelete(template.id);
                          }}
                          className="text-error hover:text-error"
                        >
                          <Icon name="delete" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
